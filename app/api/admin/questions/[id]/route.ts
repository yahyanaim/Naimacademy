import { connectDB } from "@/lib/db/mongoose";
import { Question } from "@/lib/models/question.model";
import { Exam } from "@/lib/models/exam.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const questionUpdateSchema = z.object({
  question: z.string().min(1).optional(),
  options: z.array(z.string()).min(2).optional(),
  correctAnswer: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const PUT = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const { id } = await ctx.params;
      const body = await req.json();

      const parsed = questionUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const question = await Question.findByIdAndUpdate(id, parsed.data, { new: true });
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
