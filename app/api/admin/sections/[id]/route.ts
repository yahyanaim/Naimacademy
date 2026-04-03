import { connectDB } from "@/lib/db/mongoose";
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

      const section = await Section.findByIdAndUpdate(id, body, { new: true });
      if (!section) {
        return NextResponse.json({ error: "Section not found" }, { status: 404 });
      }

      return NextResponse.json(section);
    } catch (error) {
      console.error("PUT /api/admin/sections/[id] error:", error);
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

      const section = await Section.findByIdAndDelete(id);
      if (!section) {
        return NextResponse.json({ error: "Section not found" }, { status: 404 });
      }

      await Course.findByIdAndUpdate(section.courseId, {
        $pull: { sections: section._id },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/admin/sections/[id] error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
