import { connectDB } from "@/lib/db/mongoose";
import { Lesson } from "@/lib/models/lesson.model";
import { Section } from "@/lib/models/section.model";
import { Course } from "@/lib/models/course.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const PUT = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const { id } = await ctx.params;
      const body = await req.json();

      const lesson = await Lesson.findByIdAndUpdate(id, body, { new: true });
      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }

      return NextResponse.json(lesson);
    } catch (error) {
      console.error("PUT /api/admin/lessons/[id] error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const DELETE = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const { id } = await ctx.params;

      const lesson = await Lesson.findByIdAndDelete(id);
      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }

      const section = await Section.findByIdAndUpdate(lesson.sectionId, {
        $pull: { lessons: lesson._id },
      });

      if (section) {
        await Course.findByIdAndUpdate(section.courseId, {
          $inc: { totalLessons: -1 },
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/admin/lessons/[id] error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
