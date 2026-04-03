import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { Exam } from "@/lib/models/exam.model";
import { Question } from "@/lib/models/question.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

// Ensure Question model is registered
Question;

export const GET = withAuth(
  async (
    req: NextRequest,
    ctx: { user: { userId: string; role: string } }
  ): Promise<NextResponse> => {
    try {
      await connectDB();

      const user = await User.findById(ctx.user.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const latestAttempt = user.examAttempts[user.examAttempts.length - 1];
      if (!latestAttempt) {
        return NextResponse.json({ error: "No attempts found" }, { status: 404 });
      }

      const exam = await Exam.findById(latestAttempt.examId).populate("questions");
      if (!exam) {
        return NextResponse.json({ error: "Exam definition not found" }, { status: 404 });
      }

      // Map questions to results using stored answers
      const results = (exam.questions as any[]).map((q, idx) => ({
        question: q.question,
        options: q.options,
        userAnswer: (latestAttempt as any).answers[idx],
        correctAnswer: q.correctAnswer,
        isCorrect: (latestAttempt as any).answers[idx] === q.correctAnswer,
        notes: q.notes || "",
      }));
      
      return NextResponse.json({
        score: latestAttempt.score,
        passed: latestAttempt.passed,
        total: latestAttempt.total,
        correct: latestAttempt.correct,
        results
      });
    } catch (error) {
      console.error("[GET /api/exam/results/latest]", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
