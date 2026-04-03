import { connectDB } from "@/lib/db/mongoose";
import { seed } from "@/lib/seed";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      await seed();

      return NextResponse.json({ success: true, message: "Database seeded successfully" });
    } catch (error) {
      console.error("POST /api/admin/seed error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
