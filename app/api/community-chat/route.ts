import { connectDB } from "@/lib/db/mongoose";
import { CommunityChatMessage } from "@/lib/models/community-chat.model";
import { verifyToken } from "@/lib/auth/jwt";
import { SESSION } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

async function getUser(req: NextRequest) {
  const token = req.cookies.get(SESSION.COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const lastId = searchParams.get("lastId");

  if (!courseId) {
    return NextResponse.json({ error: "Course ID required" }, { status: 400 });
  }

  await connectDB();

  try {
    const query: any = { courseId };
    if (lastId) {
      query._id = { $lt: lastId };
    }

    const messages = await CommunityChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("userId", "name email avatar")
      .lean();

    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error("GET /api/community-chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { courseId, content } = await req.json();

    if (!courseId || !content) {
      return NextResponse.json({ error: "Course ID and content required" }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Content too long (max 1000 chars)" }, { status: 400 });
    }

    const message = await CommunityChatMessage.create({
      courseId,
      userId: user.userId,
      content,
    });

    const populatedMessage = await CommunityChatMessage.findById(message._id)
      .populate("userId", "name email avatar")
      .lean();

    return NextResponse.json(populatedMessage);
  } catch (error) {
    console.error("POST /api/community-chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
