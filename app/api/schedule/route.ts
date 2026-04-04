import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { Course } from "@/lib/models/course.model";
import { Lesson } from "@/lib/models/lesson.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(
  async (
    _req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const dbUser = await User.findById(ctx.user.userId).select("learningSchedule progress");

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (!dbUser.learningSchedule) {
        return NextResponse.json({ schedule: null }, { status: 200 });
      }

      const course = await Course.findOne().populate({
        path: "sections",
        populate: { path: "lessons", select: "title duration" },
      });

      const totalLessons = course?.sections?.reduce(
        (sum: number, s: { lessons: unknown[] }) => sum + s.lessons.length, 0
      ) ?? 0;

      const completedCount = dbUser.progress?.completedLessons?.length ?? 0;
      const remainingLessons = totalLessons - completedCount;
      const lessonsPerWeek = dbUser.learningSchedule.lessonsPerWeek;
      const weeksRemaining = lessonsPerWeek > 0 ? Math.ceil(remainingLessons / lessonsPerWeek) : 0;

      return NextResponse.json({
        schedule: dbUser.learningSchedule,
        stats: {
          totalLessons,
          completedLessons: completedCount,
          remainingLessons,
          weeksRemaining,
        },
      }, { status: 200 });
    } catch (error) {
      console.error("[GET /api/schedule]", error);
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

      const body = await req.json();
      const { lessonsPerWeek, daysOfWeek, startDate } = body;

      if (!lessonsPerWeek || !startDate) {
        return NextResponse.json({ error: "lessonsPerWeek and startDate are required" }, { status: 400 });
      }

      const course = await Course.findOne().populate({
        path: "sections",
        populate: { path: "lessons", select: "_id" },
      });

      const totalLessons = course?.sections?.reduce(
        (sum: number, s: { lessons: unknown[] }) => sum + s.lessons.length, 0
      ) ?? 0;

      const dbUser = await User.findById(ctx.user.userId);
      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const weeksNeeded = Math.ceil(totalLessons / lessonsPerWeek);
      const start = new Date(startDate);
      const endDate = new Date(start);
      endDate.setDate(endDate.getDate() + weeksNeeded * 7);

      dbUser.learningSchedule = {
        lessonsPerWeek,
        daysOfWeek: daysOfWeek || [1, 2, 3, 4, 5],
        startDate: start,
        endDate,
      };

      await dbUser.save();

      return NextResponse.json({
        schedule: dbUser.learningSchedule,
        estimatedCompletion: endDate,
      }, { status: 200 });
    } catch (error) {
      console.error("[POST /api/schedule]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const DELETE = withAuth(
  async (
    _req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const dbUser = await User.findById(ctx.user.userId);
      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      dbUser.learningSchedule = null;
      await dbUser.save();

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("[DELETE /api/schedule]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
