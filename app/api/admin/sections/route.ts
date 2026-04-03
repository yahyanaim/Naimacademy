import { connectDB } from "@/lib/db/mongoose";
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

      const sections = await Section.find().sort({ order: 1 });
      return NextResponse.json(sections);
    } catch (error) {
      console.error("GET /api/admin/sections error:", error);
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
      const { title, order, courseId } = body;

      const section = await Section.create({ title, order, courseId });

      await Course.findByIdAndUpdate(courseId, {
        $push: { sections: section._id },
      });

      return NextResponse.json(section, { status: 201 });
    } catch (error) {
      console.error("POST /api/admin/sections error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
