import { connectDB } from "@/lib/db/mongoose";
import { Course } from "@/lib/models/course.model";
import { Lesson } from "@/lib/models/lesson.model";
import { Section } from "@/lib/models/section.model";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

Lesson;
Section;

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
      const unlockedSections: string[] = [];
      if (course?.sections) {
        for (const section of course.sections as Array<{ _id: string; isLocked: boolean; lessons: Array<{ _id: unknown }> }>) {
          totalLessons += section.lessons?.length ?? 0;
          if (!section.isLocked) {
            unlockedSections.push(section._id);
          }
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

      // Auto-unlock: check if all lessons in the first locked section are completed
      const allSections = await Section.find({ courseId: course?._id }).sort({ order: 1 });
      let allUnlockedLessonsCompleted = 0;

      for (const section of allSections) {
        if (!section.isLocked) {
          const sectionLessons = await Lesson.find({ sectionId: section._id });
          for (const lesson of sectionLessons) {
            if (completedLessons.includes(lesson._id.toString())) {
              allUnlockedLessonsCompleted++;
            }
          }
        } else {
          // Found first locked section - check if all previous unlocked lessons are done
          const totalUnlockedLessons = allSections
            .filter(s => !s.isLocked)
            .reduce((sum, s) => sum + (s.lessons?.length ?? 0), 0);

          if (allUnlockedLessonsCompleted >= totalUnlockedLessons) {
            section.isLocked = false;
            await section.save();
            console.log(`[AUTO-UNLOCK] Section "${section.title}" unlocked`);
          }
          break;
        }
      }

      return NextResponse.json({ 
        progress: dbUser.progress,
        sectionUnlocked: allUnlockedLessonsCompleted > completedLessons.length - 1
      }, { status: 200 });
    } catch (error) {
      console.error("[POST /api/progress]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
