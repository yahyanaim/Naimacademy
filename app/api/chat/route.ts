import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

const MAX_QUESTIONS_PER_DAY = 5;
const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const API_KEY = `Bearer ${process.env.NVIDIA_API_KEY || ""}`;
const MODEL = process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct";

interface ChatQuestion {
  question: string;
  answeredAt: Date;
}

export const POST = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const body = await req.json();
      const { question, context } = body;

      if (!question?.trim()) {
        return NextResponse.json({ error: "Question is required" }, { status: 400 });
      }

      const user = await User.findById(ctx.user.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayQuestions = (user.chatQuestions || []).filter(
        (q: ChatQuestion) => new Date(q.answeredAt) >= today
      );

      if (todayQuestions.length >= MAX_QUESTIONS_PER_DAY) {
        return NextResponse.json(
          { error: `You have reached the maximum of ${MAX_QUESTIONS_PER_DAY} questions per day. Try again tomorrow!` },
          { status: 429 }
        );
      }

      const systemPrompt = `You are a helpful teaching assistant for a course about n8n workflow automation. You help students understand video lessons and answer their questions. Be concise, friendly, and educational. Current lesson context: ${context || "General course questions"}`;

      const response = await fetch(INVOKE_URL, {
        method: "POST",
        headers: {
          "Authorization": API_KEY,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ],
          max_tokens: 16384,
          temperature: 1.00,
          top_p: 0.95,
          stream: false,
          chat_template_kwargs: { enable_thinking: false },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("NVIDIA API error status:", response.status);
        console.error("NVIDIA API error body:", errorText);
        return NextResponse.json({ error: "Failed to get response from AI", details: errorText, status: response.status }, { status: 500 });
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

      if (!user.chatQuestions) {
        user.chatQuestions = [];
      }
      user.chatQuestions.push({ question, answeredAt: new Date() });
      
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      user.chatQuestions = user.chatQuestions.filter(
        (q: ChatQuestion) => new Date(q.answeredAt) >= oneDayAgo
      );
      
      await user.save();

      const remainingQuestions = MAX_QUESTIONS_PER_DAY - (todayQuestions.length + 1);

      return NextResponse.json({
        answer,
        remainingQuestions,
      });
    } catch (error) {
      console.error("[POST /api/chat/route.ts]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);