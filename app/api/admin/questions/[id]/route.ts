import { connectDB } from "@/lib/db/mongoose";
import { Question } from "@/lib/models/question.model";
import { Exam } from "@/lib/models/exam.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const PUT = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const { id } = await ctx.params;
      const body = await req.json();

      const question = await Question.findByIdAndUpdate(id, body, { new: true });
      if (!question) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }

      return NextResponse.json(question);
    } catch (error) {
      console.error("PUT /api/admin/questions/[id] error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const DELETE = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const { id } = await ctx.params;

      const question = await Question.findByIdAndDelete(id);
      if (!question) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }

      await Exam.findByIdAndUpdate(question.examId, {
        $pull: { questions: question._id },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/admin/questions/[id] error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
