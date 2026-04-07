import { connectDB } from "@/lib/db/mongoose";
import { Notification } from "@/lib/models/notification.model";
import { User } from "@/lib/models/user.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAdmin(
  async (_req: NextRequest) => {
    try {
      await connectDB();

      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      return NextResponse.json(notifications);
    } catch (error) {
      console.error("GET /api/admin/notifications error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const POST = withAdmin(
  async (req: NextRequest) => {
    try {
      await connectDB();

      const { title, message, type, userId } = await req.json();

      if (!title || !message || !type) {
        return NextResponse.json({ error: "Title, message and type are required" }, { status: 400 });
      }

      let users;

      if (userId) {
        users = [await User.findById(userId)];
      } else if (type === "new_user") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        users = await User.find({ createdAt: { $gte: sevenDaysAgo } });
      } else {
        users = await User.find();
      }

      const notifications = await Notification.insertMany(
        users.map((user: Record<string, unknown>) => ({
          userId: (user as Record<string, { _id: unknown }>)._id,
          title,
          message,
          type,
        }))
      );

      return NextResponse.json({ success: true, count: notifications.length }, { status: 201 });
    } catch (error) {
      console.error("POST /api/admin/notifications error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
