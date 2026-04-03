import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const users = await User.find()
        .select("-password")
        .populate("progress.completedLessons")
        .lean();

      return NextResponse.json(users);
    } catch (error) {
      console.error("GET /api/admin/users error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
