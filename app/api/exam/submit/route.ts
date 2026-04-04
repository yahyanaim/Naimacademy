import { connectDB } from "@/lib/db/mongoose";
import { Exam } from "@/lib/models/exam.model";
import { Question } from "@/lib/models/question.model";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

Question;

const EXAM_SUBMISSION_LOCK = new Map<string, number>();
const LOCK_TIMEOUT_MS = 10000;

function acquireLock(userId: string): boolean {
  const now = Date.now();
  const lastSubmission = EXAM_SUBMISSION_LOCK.get(userId);
  if (lastSubmission && now - lastSubmission < LOCK_TIMEOUT_MS) {
    return false;
  }
  EXAM_SUBMISSION_LOCK.set(userId, now);
  setTimeout(() => EXAM_SUBMISSION_LOCK.delete(userId), LOCK_TIMEOUT_MS);
  return true;
}

export const POST = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ): Promise<NextResponse> => {
    try {
      await connectDB();

      if (ctx.user.role === "admin") {
        return NextResponse.json({ message: "Admin exam not tracked" }, { status: 200 });
      }

      if (!acquireLock(ctx.user.userId)) {
        return NextResponse.json(
          { error: "Please wait before submitting again" },
          { status: 429 }
        );
      }

      let body;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      const { examId, answers } = body as {
        examId: string;
        answers: { questionId: string; answer: number }[];
      };

      if (!examId || !Array.isArray(answers)) {
        return NextResponse.json(
          { error: "examId and answers are required" },
          { status: 400 }
        );
      }

      if (!examId.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ error: "Invalid exam ID format" }, { status: 400 });
      }

      const exam = await Exam.findById(examId)
        .populate("questions")
        .populate("courseId", "title");

      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
        return NextResponse.json({ error: "Exam has no questions defined" }, { status: 500 });
      }

      const mappedUserAnswers: number[] = new Array(exam.questions.length).fill(-1);
      let correctCount = 0;

      for (const studentAns of answers) {
        const qIndex = exam.questions.findIndex((q) => {
          if (!q) return false;
          const id = q._id ? q._id.toString() : q.toString();
          return id === studentAns.questionId;
        });

        if (qIndex !== -1) {
          const question = exam.questions[qIndex];
          if (question && typeof question === "object" && "correctAnswer" in question) {
            const isCorrect = studentAns.answer === question.correctAnswer;
            if (isCorrect) correctCount++;
            mappedUserAnswers[qIndex] = studentAns.answer;
          }
        }
      }

      const total = exam.questions.length;
      const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const passed = score >= (exam.passingScore || 70);

      try {
        const updateData: Record<string, unknown> = {
          $push: {
            examAttempts: {
              examId,
              examTitle: exam.title,
              score,
              passed,
              total,
              correct: correctCount,
              answers: mappedUserAnswers,
              submittedAt: new Date(),
            },
          },
        };

        if (passed) {
          const user = await User.findById(ctx.user.userId);
          const alreadyCertified = user?.certifications?.some(
            (c: { examId: string }) => c.examId === examId
          );

          if (!alreadyCertified) {
            const certificationId = `CERT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
            const courseIdObj = exam.courseId as Record<string, unknown>;
            const courseIdStr = courseIdObj?._id
              ? String((courseIdObj._id as { toString: () => string }).toString())
              : String(courseIdObj ?? "");
            const courseTitleStr = (courseIdObj?.title as string) || exam.title;

            (updateData.$push as Record<string, unknown>).certifications = {
              certificationId,
              examId,
              examTitle: exam.title,
              courseId: courseIdStr,
              courseTitle: courseTitleStr,
              studentName: user?.name || "Student",
              score,
              issuedAt: new Date(),
            };
            (updateData as Record<string, unknown>).$set = { certificateIssued: true };
          }
        }

        await User.findByIdAndUpdate(ctx.user.userId, updateData);
      } catch {
        return NextResponse.json(
          { error: "Failed to save progress" },
          { status: 500 }
        );
      }

      return NextResponse.json({ score, passed, total, correct: correctCount });
    } catch {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
