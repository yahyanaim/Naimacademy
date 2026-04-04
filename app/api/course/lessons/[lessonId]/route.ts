import { connectDB } from "@/lib/db/mongoose";
import { Lesson } from "@/lib/models/lesson.model";
import { Section } from "@/lib/models/section.model";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(
  async (
    _req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ): Promise<NextResponse> => {
    try {
      await connectDB();

      const { lessonId } = await ctx.params;

      const lesson = await Lesson.findById(lessonId);

      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }

      const section = await Section.findById(lesson.sectionId);
      if (section?.isLocked && ctx.user.role !== "admin") {
        return NextResponse.json({ error: "This section is locked" }, { status: 403 });
      }

      const dbUser = await User.findById(ctx.user.userId).select("progress");

      const completedLessons: string[] = dbUser?.progress?.completedLessons?.map(String) ?? [];
      const isCompleted = completedLessons.includes(String(lessonId));
      const lastVideoTimestamp =
        dbUser?.progress?.lastLessonId?.toString() === String(lessonId)
          ? (dbUser?.progress?.lastVideoTimestamp ?? 0)
          : 0;

      return NextResponse.json(
        {
          lesson,
          progress: {
            isCompleted,
            lastVideoTimestamp,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("[GET /api/course/lessons/[lessonId]]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
