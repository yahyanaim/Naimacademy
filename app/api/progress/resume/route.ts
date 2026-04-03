import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ): Promise<NextResponse> => {
    try {
      await connectDB();

      const { lessonId, timestamp } = await req.json();

      if (ctx.user.role === "admin") {
        return NextResponse.json({ message: "Admin progress not tracked" }, { status: 200 });
      }

      if (!lessonId || timestamp === undefined) {
        return NextResponse.json(
          { error: "lessonId and timestamp are required" },
          { status: 400 }
        );
      }

      const dbUser = await User.findById(ctx.user.userId);

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      dbUser.progress = {
        ...dbUser.progress,
        lastLessonId: lessonId,
        lastVideoTimestamp: timestamp,
      };

      await dbUser.save();

      return NextResponse.json({ progress: dbUser.progress }, { status: 200 });
    } catch (error) {
      console.error("[POST /api/progress/resume]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
