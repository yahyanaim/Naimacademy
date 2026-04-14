import { NextRequest, NextResponse } from "next/server";
import { Admin } from "@/lib/models/admin.model";
import { withAuth } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";

export const GET = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ): Promise<NextResponse> => {
    try {
      await connectDB();

      if (ctx.user.role !== "admin") {
        return NextResponse.json({ error: "Not an admin" }, { status: 403 });
      }

      const admin = await Admin.findById(ctx.user.userId).lean();

      if (!admin) {
        return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      }

      return NextResponse.json({
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar || "NO AVATAR",
        hasAvatar: !!admin.avatar,
      });
    } catch (error) {
      console.error("[DEBUG ADMIN]", error);
      return NextResponse.json({ error: "Error" }, { status: 500 });
    }
  }
);
