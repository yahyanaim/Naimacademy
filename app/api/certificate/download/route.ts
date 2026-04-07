import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { Notification } from "@/lib/models/notification.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const user = await User.findById(ctx.user.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const cert = user.certifications?.[0];
      if (!cert) {
        return NextResponse.json(
          { error: "No certificate found" },
          { status: 404 }
        );
      }

      const passedAttempt = user.examAttempts.find(
        (attempt: { passed: boolean }) => attempt.passed === true
      );
      if (!passedAttempt) {
        return NextResponse.json(
          { error: "No certificate found" },
          { status: 404 }
        );
      }

      const completionPercentage = user.progress?.completionPercentage ?? 0;
      if (completionPercentage < 100) {
        return NextResponse.json(
          { error: "No certificate found" },
          { status: 404 }
        );
      }

      const baseUrl = req.nextUrl.origin;
      return NextResponse.redirect(
        new URL(`/certificate/${cert.certificationId}?download=true`, baseUrl)
      );
    } catch (error) {
      console.error("[GET /api/certificate/download]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const POST = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const user = await User.findById(ctx.user.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const completionPercentage = user.progress?.completionPercentage ?? 0;
      if (completionPercentage < 100) {
        return NextResponse.json(
          { error: "Course not completed" },
          { status: 400 }
        );
      }

      const passedAttempt = user.examAttempts.find(
        (attempt: { passed: boolean }) => attempt.passed === true
      );
      if (!passedAttempt) {
        return NextResponse.json(
          { error: "Exam not passed" },
          { status: 400 }
        );
      }

      user.certificateIssued = true;
      if (!user.certifications) user.certifications = [];
      user.certifications.push({
        certificationId: `CERT-${Date.now()}`,
        examId: "exam-1",
        examTitle: "n8n Automation Certification Exam",
        courseId: "course-1",
        courseTitle: "Mastering n8n Automation",
        studentName: user.name,
        score: passedAttempt.score,
        issuedAt: new Date(),
      });
      await user.save();

      // Send notification
      await Notification.create({
        userId: user._id,
        title: "Certificate Earned!",
        message: `Congratulations! You've earned your n8n Automation Certificate with a score of ${passedAttempt.score}%`,
        type: "certificate",
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[POST /api/certificate/download]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
