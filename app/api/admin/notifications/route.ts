import { connectDB } from "@/lib/db/mongoose";
import { Notification } from "@/lib/models/notification.model";
import { User } from "@/lib/models/user.model";
import { verifyToken } from "@/lib/auth/jwt";
import { SESSION } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION.COOKIE_NAME)?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  
  return payload;
}

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
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

export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { title, message, type, userIds, url } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    console.log("[NOTIFICATIONS] Request received:", { 
      title, 
      type, 
      url,
      userIdsCount: userIds?.length,
      userIds: userIds
    });

    let students;
    
    if (Array.isArray(userIds) && userIds.length > 0) {
      students = await User.find({ _id: { $in: userIds } }).select("_id");
      console.log("[NOTIFICATIONS] Sending to specific users:", students.length);
    } else {
      students = await User.find({ role: "student" }).select("_id");
      console.log("[NOTIFICATIONS] Sending to all students:", students.length);
    }
    
    if (students.length === 0) {
      return NextResponse.json({ error: "No students found" }, { status: 400 });
    }

    const notifications = students.map((student) => ({
      userId: student._id,
      title,
      message,
      type: type || "general",
      read: false,
      url: url || "",
    }));

    await Notification.insertMany(notifications);

    return NextResponse.json({ success: true, count: students.length });
  } catch (error) {
    console.error("POST /api/admin/notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { notificationId } = await req.json();

    await Notification.findByIdAndDelete(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}