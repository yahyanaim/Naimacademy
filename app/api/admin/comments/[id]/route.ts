import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Comment } from "@/lib/models/comment.model";
import { verifyToken } from "@/lib/auth/jwt";
import { SESSION } from "@/lib/constants";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION.COOKIE_NAME)?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  
  return payload;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    const comment = await Comment.findById(id).populate("articleSlug", "title").lean();

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json({ error: "Failed to fetch comment" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { id } = await params;
    const { adminReply } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    if (!adminReply || adminReply.trim().length < 2) {
      return NextResponse.json({ error: "Reply must be at least 2 characters" }, { status: 400 });
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      {
        adminReply: adminReply.trim(),
        isReplied: true,
        repliedAt: new Date(),
      },
      { new: true }
    );

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    await Comment.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
