import { connectDB } from "@/lib/db/mongoose";
import { Course } from "@/lib/models/course.model";
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

      const dbUser = await User.findById(ctx.user.userId).select("progress learningSchedule");

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ progress: dbUser.progress, learningSchedule: dbUser.learningSchedule }, { status: 200 });
    } catch (error) {
      console.error("[GET /api/progress]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const POST = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ): Promise<NextResponse> => {
    try {
      await connectDB();

      const { lessonId } = await req.json();

      if (ctx.user.role === "admin") {
        return NextResponse.json({ message: "Admin progress not tracked" }, { status: 200 });
      }

      if (!lessonId) {
        return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
      }

      const dbUser = await User.findById(ctx.user.userId);

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const completedLessons: string[] = dbUser.progress?.completedLessons?.map(String) ?? [];
      if (!completedLessons.includes(lessonId.toString())) {
        completedLessons.push(lessonId.toString());
      }

      const course = await Course.findOne().select("sections").populate({
        path: "sections",
        populate: { path: "lessons", select: "_id" },
      });

      let totalLessons = 0;
      if (course?.sections) {
        for (const section of course.sections as Array<{ lessons: Array<{ _id: unknown }> }>) {
          totalLessons += section.lessons?.length ?? 0;
        }
      }

      const completionPercentage =
        totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

      dbUser.progress = {
        ...dbUser.progress,
        completedLessons,
        completionPercentage,
      };

      await dbUser.save();

      return NextResponse.json({ 
        progress: dbUser.progress,
        sectionUnlocked: false,
        allCompleted: completedLessons.length >= totalLessons && totalLessons > 0,
      }, { status: 200 });
    } catch (error) {
      console.error("[POST /api/progress]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
