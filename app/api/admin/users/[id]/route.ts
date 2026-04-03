import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
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

      const user = await User.findByIdAndUpdate(id, body, { new: true }).select("-password");
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    } catch (error) {
      console.error("PUT /api/admin/users/[id] error:", error);
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

      // Prevent admin from deleting themselves
      if (id === ctx.user.userId) {
        return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/admin/users/[id] error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
