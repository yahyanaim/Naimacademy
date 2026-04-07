import { connectDB } from "@/lib/db/mongoose";
import { Notification } from "@/lib/models/notification.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const notifications = await Notification.find({ userId: ctx.user.userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      return NextResponse.json(notifications);
    } catch (error) {
      console.error("GET /api/notifications error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const PATCH = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const { notificationId } = await req.json();

      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: ctx.user.userId },
        { read: true }
      );

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("PATCH /api/notifications error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
