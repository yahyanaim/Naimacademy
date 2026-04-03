import { connectDB } from "@/lib/db/mongoose";
import { Course } from "@/lib/models/course.model";
import { Section } from "@/lib/models/section.model";
import { Lesson } from "@/lib/models/lesson.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // 1. Get the course
    const courseDoc = await Course.findOne();
    if (!courseDoc) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 2. Get all sections for this course
    const sections = await Section.find({ courseId: courseDoc._id }).sort({ order: 1 });

    // 3. Get all lessons for these sections
    const sectionIds = sections.map((s) => s._id);
    const lessons = await Lesson.find({ sectionId: { $in: sectionIds } }).sort({ order: 1 });

    // 4. Group lessons by sectionId
    const course = courseDoc.toObject();
    course.sections = sections.map((section) => {
      const s = section.toObject();
      s.lessons = lessons
        .filter((l) => l.sectionId.toString() === s._id.toString())
        .sort((a, b) => a.order - b.order);
      return s;
    });

    return NextResponse.json({ course }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/course]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
