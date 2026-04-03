import { connectDB } from "@/lib/db/mongoose";
import { Exam } from "@/lib/models/exam.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const exam = await Exam.findOne().select(
      "title questionCount timeLimitMinutes passingScore"
    );

    if (!exam) {
      return NextResponse.json({ error: "No exam found" }, { status: 404 });
    }

    return NextResponse.json({
      title: exam.title,
      questionCount: exam.questionCount,
      timeLimitMinutes: exam.timeLimitMinutes,
      passingScore: exam.passingScore,
    });
  } catch (error) {
    console.error("[GET /api/exam]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
