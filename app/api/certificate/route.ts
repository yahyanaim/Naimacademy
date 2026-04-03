import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
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

      const passedAttempt = user.examAttempts.find(
        (attempt: { passed: boolean; submittedAt: Date }) => attempt.passed === true
      );

      if (!passedAttempt) {
        return NextResponse.json(
          { error: "User has not passed the exam" },
          { status: 403 }
        );
      }

      return NextResponse.json({
        userName: user.name,
        courseName: "Mastering n8n Automation",
        completionDate: passedAttempt.submittedAt,
        certificateIssued: user.certificateIssued,
      });
    } catch (error) {
      console.error("GET /api/certificate error:", error);
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

      user.certificateIssued = true;
      await user.save();

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("POST /api/certificate error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
