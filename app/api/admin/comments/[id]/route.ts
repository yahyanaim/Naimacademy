import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Comment } from "@/lib/models/comment.model";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const comment = await Comment.findById(id).lean();

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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminReply } = body;

    if (!adminReply || adminReply.trim().length < 2) {
      return NextResponse.json(
        { error: "Reply must be at least 2 characters" },
        { status: 400 }
      );
    }

    await connectDB();
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

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}
