import { connectDB } from "@/lib/db/mongoose";
import { Exam } from "@/lib/models/exam.model";
import { Question } from "@/lib/models/question.model";
import { User } from "@/lib/models/user.model";
import { Course } from "@/lib/models/course.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Register Question model
Question;

export const POST = withAuth(
  async (
    req: NextRequest,
    ctx: {
      params: Promise<Record<string, string>>;
      user: { userId: string; role: string };
    }
  ): Promise<NextResponse> => {
    try {
      await connectDB();

      let body;
      try {
        body = await req.json();
      } catch (e) {
        console.error("[SUBMIT] Failed to parse request body:", e);
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      console.log("[SUBMIT] Received body for examId:", body?.examId);

      const { examId, answers } = body as {
        examId: string;
        answers: { questionId: string; answer: number }[];
      };

      if (!examId || !Array.isArray(answers)) {
        console.error("[SUBMIT] Missing fields:", { examId, answersType: typeof answers });
        return NextResponse.json(
          { error: "examId and answers are required" },
          { status: 400 }
        );
      }

      // Validate examId format
      if (!examId.match(/^[0-9a-fA-F]{24}$/)) {
         return NextResponse.json({ error: "Invalid exam ID format" }, { status: 400 });
      }

      const exam = await Exam.findById(examId)
        .populate("questions")
        .populate("courseId", "title");

      if (!exam) {
        console.error("[SUBMIT] Exam not found in DB:", examId);
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      console.log("[SUBMIT] Exam found:", exam.title, "Questions:", exam.questions?.length);

      // Map student answers to exam questions using IDs
      if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
        console.error("[SUBMIT] exam.questions is invalid", exam.questions);
        return NextResponse.json({ error: "Exam has no questions defined" }, { status: 500 });
      }

      const mappedUserAnswers: number[] = new Array(exam.questions.length).fill(-1);
      const results: any[] = [];
      let correctCount = 0;

      for (const studentAns of answers) {
        const qIndex = (exam.questions as any[]).findIndex(
          (q) => {
            if (!q) return false;
            const id = q._id ? q._id.toString() : q.toString();
            return id === studentAns.questionId;
          }
        );

        if (qIndex !== -1) {
          const question = (exam.questions as any[])[qIndex];
          if (question && typeof question === 'object' && 'correctAnswer' in question) {
            const isCorrect = studentAns.answer === question.correctAnswer;
            if (isCorrect) correctCount++;

            mappedUserAnswers[qIndex] = studentAns.answer;

            results.push({
              question: question.question,
              options: question.options,
              userAnswer: studentAns.answer,
              correctAnswer: question.correctAnswer,
              isCorrect,
              notes: question.notes || "",
            });
          }
        }
      }

      const total = exam.questions.length;
      const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const passed = score >= (exam.passingScore || 70);
      const correct = correctCount;

      if (ctx.user.role !== "admin") {
        try {
          const updateData: any = {
            $push: {
              examAttempts: {
                examId,
                examTitle: exam.title,
                score,
                passed,
                total,
                correct,
                answers: mappedUserAnswers,
                submittedAt: new Date(),
              }
            }
          };

          // Issue certificate if passed and not already issued
          if (passed) {
            const user = await User.findById(ctx.user.userId);
            const alreadyCertified = user?.certifications?.some((c: any) => c.examId === examId);
            
            if (!alreadyCertified) {
              const certificationId = `CERT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
              const courseIdObj = (exam.courseId as any);
              const courseIdStr = courseIdObj?._id ? courseIdObj._id.toString() : (courseIdObj?.toString() || "");
              const courseTitleStr = courseIdObj?.title || exam.title;

              updateData.$push.certifications = {
                certificationId,
                examId,
                examTitle: exam.title,
                courseId: courseIdStr,
                courseTitle: courseTitleStr,
                studentName: user?.name || "Student",
                score,
                issuedAt: new Date(),
              };
              updateData.$set = { certificateIssued: true };
            }
          }

          await User.findByIdAndUpdate(ctx.user.userId, updateData);
          console.log("[SUBMIT] User progress updated atomically");
        } catch (saveError) {
          console.error("[SUBMIT] Error updating user progress:", saveError);
          return NextResponse.json({ 
            error: "Failed to save progress", 
            details: saveError instanceof Error ? saveError.message : String(saveError)
          }, { status: 500 });
        }
      }

      return NextResponse.json({ score, passed, total, correct, results });
    } catch (error: any) {
      console.error("[POST /api/exam/submit] CRITICAL ERROR:", error);
      return NextResponse.json(
        { 
          error: "Internal server error", 
          details: error.message || String(error)
        },
        { status: 500 }
      );
    }
  }
);
