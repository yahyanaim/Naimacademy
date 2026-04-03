import { connectDB } from "@/lib/db/mongoose";
import { Lesson } from "@/lib/models/lesson.model";
import { Section } from "@/lib/models/section.model";
import { Course } from "@/lib/models/course.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const lessons = await Lesson.find();
      return NextResponse.json(lessons);
    } catch (error) {
      console.error("GET /api/admin/lessons error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const POST = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const body = await req.json();
      const { title, videoUrl, description, resources, sectionId, order, duration } = body;

      const lesson = await Lesson.create({
        title,
        videoUrl,
        description,
        resources,
        sectionId,
        order,
        duration,
      });

      const section = await Section.findByIdAndUpdate(sectionId, {
        $push: { lessons: lesson._id },
      });

      if (section) {
        await Course.findByIdAndUpdate(section.courseId, {
          $inc: { totalLessons: 1 },
        });
      }

      return NextResponse.json(lesson, { status: 201 });
    } catch (error) {
      console.error("POST /api/admin/lessons error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
