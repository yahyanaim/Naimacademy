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

      // Auto-unlock sections
      const allSections = await Section.find({ courseId: course?._id }).sort({ order: 1 });
      let sectionUnlocked = false;
      let allCompleted = false;

      // Build a map of section -> completed lesson count
      const sectionCompletedMap = new Map<string, number>();
      const sectionTotalMap = new Map<string, number>();

      for (const section of allSections) {
        const sectionLessons = await Lesson.find({ sectionId: section._id });
        sectionTotalMap.set(section._id.toString(), sectionLessons.length);
        const completedInSection = sectionLessons.filter(l =>
          completedLessons.includes(l._id.toString())
        ).length;
        sectionCompletedMap.set(section._id.toString(), completedInSection);
      }

      // Unlock sections sequentially
      for (const section of allSections) {
        if (section.isLocked) {
          // Check if ALL previous sections are fully completed
          let allPreviousComplete = true;
          for (const prevSection of allSections) {
            if (prevSection._id.toString() === section._id.toString()) break;
            const prevTotal = sectionTotalMap.get(prevSection._id.toString()) ?? 0;
            const prevCompleted = sectionCompletedMap.get(prevSection._id.toString()) ?? 0;
            if (prevCompleted < prevTotal) {
              allPreviousComplete = false;
              break;
            }
          }

          if (allPreviousComplete) {
            section.isLocked = false;
            await section.save();
            sectionUnlocked = true;
            console.log(`[AUTO-UNLOCK] Section "${section.title}" unlocked`);
          }
        }
      }

      // Check if all lessons are completed
      if (completedLessons.length >= totalLessons && totalLessons > 0) {
        allCompleted = true;
        // Unlock ALL sections
        await Section.updateMany({ courseId: course?._id, isLocked: true }, { $set: { isLocked: false } });
        console.log("[AUTO-UNLOCK] All sections unlocked - course completed");
      }

      return NextResponse.json({ 
        progress: dbUser.progress,
        sectionUnlocked,
        allCompleted,
      }, { status: 200 });
    } catch (error) {
      console.error("[POST /api/progress]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
