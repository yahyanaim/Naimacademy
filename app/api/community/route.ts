import { connectDB } from "@/lib/db/mongoose";
import { CommunityPost } from "@/lib/models/community-post.model";
import { User } from "@/lib/models/user.model";
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

  if (!courseId) {
    return NextResponse.json({ error: "Course ID required" }, { status: 400 });
  }

  await connectDB();

  try {
    const posts = await CommunityPost.find({
      courseId,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .populate("userId", "name email avatar")
      .lean();

    const formattedPosts = posts.map((post) => ({
      _id: post._id,
      content: post.content,
      likes: post.likes,
      user: post.userId,
      createdAt: post.createdAt,
      expiresAt: post.expiresAt,
      isLiked: post.likes.some((like: any) => like.toString() === user.userId),
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("GET /api/community error:", error);
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

    if (content.length > 500) {
      return NextResponse.json({ error: "Content too long (max 500 chars)" }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const post = await CommunityPost.create({
      courseId,
      userId: user.userId,
      content,
      expiresAt,
    });

    const populatedPost = await CommunityPost.findById(post._id)
      .populate("userId", "name email avatar")
      .lean();

    return NextResponse.json({
      ...populatedPost,
      isLiked: false,
    });
  } catch (error) {
    console.error("POST /api/community error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("id");

  if (!postId) {
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  }

  await connectDB();

  try {
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await CommunityPost.findByIdAndDelete(postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/community error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId, action } = await req.json();

  if (!postId || !action) {
    return NextResponse.json({ error: "Post ID and action required" }, { status: 400 });
  }

  await connectDB();

  try {
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (action === "like") {
      if (post.likes.includes(user.userId as any)) {
        post.likes = post.likes.filter((id: any) => id.toString() !== user.userId);
      } else {
        post.likes.push(user.userId as any);
      }
      await post.save();
    }

    return NextResponse.json({
      likes: post.likes,
      isLiked: post.likes.includes(user.userId as any),
    });
  } catch (error) {
    console.error("PATCH /api/community error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
