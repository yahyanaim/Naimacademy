import { connectDB } from "@/lib/db/mongoose";
import { Notification } from "@/lib/models/notification.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const { notificationId } = await req.json();

      await Notification.findByIdAndDelete(notificationId);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/admin/notifications error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);