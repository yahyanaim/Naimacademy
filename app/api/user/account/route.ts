import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = withAuth(
  async (
    _req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      await User.findByIdAndDelete(ctx.user.userId);

      const response = NextResponse.json({ success: true }, { status: 200 });
      response.cookies.set("auth-token", "", { maxAge: 0, path: "/" });

      return response;
    } catch (error) {
      console.error("[DELETE /api/user/account]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
