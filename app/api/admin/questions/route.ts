import { connectDB } from "@/lib/db/mongoose";
import { Question } from "@/lib/models/question.model";
import { Exam } from "@/lib/models/exam.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const questions = await Question.find().sort({ order: 1 });
      return NextResponse.json(questions);
    } catch (error) {
      console.error("GET /api/admin/questions error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const POST = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const body = await req.json();
      const { examId, type, question, options, correctAnswer, order } = body;

      const newQuestion = await Question.create({
        examId,
        type,
        question,
        options,
        correctAnswer,
        order,
      });

      await Exam.findByIdAndUpdate(examId, {
        $push: { questions: newQuestion._id },
      });

      return NextResponse.json(newQuestion, { status: 201 });
    } catch (error) {
      console.error("POST /api/admin/questions error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
