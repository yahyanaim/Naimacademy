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
      console.log("[AI Chat] Request received from user:", ctx.user.userId);
      await connectDB();

      const body = await req.json();
      const { question, context } = body;
      console.log("[AI Chat] Question:", question?.substring(0, 50));
      console.log("[AI Chat] API Key present:", !!process.env.NVIDIA_API_KEY);
      console.log("[AI Chat] Model:", MODEL);

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

      const systemPrompt = `You are a helpful teaching assistant for a course about n8n workflow automation. You help students understand video lessons and answer their questions. Be concise, friendly, and educational. Keep responses under 150 words. Current lesson context: ${context || "General course questions"}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      let nvidiaResponse;
      try {
        nvidiaResponse = await fetch(INVOKE_URL, {
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
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.95,
          }),
          signal: controller.signal,
        });
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return NextResponse.json({ error: "AI response timed out. Please try again." }, { status: 504 });
        }
        throw fetchError;
      }
      clearTimeout(timeoutId);

      if (!nvidiaResponse.ok) {
        const errorText = await nvidiaResponse.text();
        console.error("NVIDIA API error status:", nvidiaResponse.status);
        console.error("NVIDIA API error body:", errorText);
        
        if (errorText.toLowerCase().includes("image") || errorText.includes("vision") || errorText.includes("does not support")) {
          return NextResponse.json({ 
            answer: 'Cannot read "image.png" (this model does not support image input). Please describe your question in text instead.',
            remainingQuestions: MAX_QUESTIONS_PER_DAY - todayQuestions.length
          });
        }
        
        return NextResponse.json({ error: "AI service unavailable. Please try again later.", details: errorText, status: nvidiaResponse.status }, { status: 500 });
      }

      const data = await nvidiaResponse.json();
      const answer = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

      if (!user.chatQuestions) {
        user.chatQuestions = [];
      }
      
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      const recentDuplicate = user.chatQuestions.find(
        (q: ChatQuestion) => q.question === question && new Date(q.answeredAt) >= oneHourAgo
      );
      if (recentDuplicate) {
        return NextResponse.json({ error: "Duplicate question asked recently. Please try again later." }, { status: 400 });
      }
      
      user.chatQuestions.push({ question, answeredAt: new Date() });
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      user.chatQuestions = user.chatQuestions.filter(
        (q: ChatQuestion) => new Date(q.answeredAt) >= thirtyDaysAgo
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