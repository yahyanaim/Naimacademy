import { connectDB } from "@/lib/db/mongoose";
import { Exam } from "@/lib/models/exam.model";
import { Question } from "@/lib/models/question.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

import { User } from "@/lib/models/user.model";

// Register Question model
Question;

export const POST = withAuth(
  async (
    _req: NextRequest,
    ctx: {
      params: Promise<Record<string, string>>;
      user: { userId: string; role: string };
    }
  ): Promise<NextResponse> => {
    try {
      await connectDB();

      if (ctx.user.role === "admin") {
        return NextResponse.json({ error: "Admins cannot take the exam" }, { status: 403 });
      }

      const userDoc = await User.findById(ctx.user.userId);
      if (!userDoc || userDoc.progress.completionPercentage < 100) {
        return NextResponse.json({ error: "Course must be 100% completed to take the exam" }, { status: 403 });
      }

      const exam = await Exam.findOne().populate(
        "questions",
        "_id type question options"
      );

      if (!exam) {
        return NextResponse.json({ error: "No exam found" }, { status: 404 });
      }

      // Shuffle questions array (Fisher-Yates)
      const questions = [...exam.questions] as Array<{
        _id: unknown;
        type: string;
        question: string;
        options: string[];
      }>;

      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }

      const sanitizedQuestions = questions.map((q) => ({
        _id: q._id,
        type: q.type,
        question: q.question,
        options: q.options,
      }));

      return NextResponse.json({
        examId: exam._id,
        timeLimitMinutes: exam.timeLimitMinutes,
        questions: sanitizedQuestions,
      });
    } catch (error) {
      console.error("[POST /api/exam/start]", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
