import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { CommunityPost } from "@/lib/models/community-post.model";
import { CommunityChat } from "@/lib/models/community-chat.model";
import { verifyToken } from "@/lib/auth/jwt";
import { SESSION } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "posts";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    await connectDB();

    if (type === "chat") {
      const skip = (page - 1) * limit;
      const messages = await CommunityChat.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return NextResponse.json({ messages: messages.reverse() });
    }

    const skip = (page - 1) * limit;
    const [pinnedPosts, regularPosts, total] = await Promise.all([
      CommunityPost.find({ isPinned: true, isExpired: false }).sort({ createdAt: -1 }).limit(10).lean(),
      CommunityPost.find({ isPinned: false, isExpired: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CommunityPost.countDocuments({ isExpired: false }),
    ]);

    const posts = [...pinnedPosts, ...regularPosts];

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching community data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION.COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    await connectDB();

    if (type === "post") {
      const { content } = body;

      if (!content || content.trim().length < 10) {
        return NextResponse.json({ error: "Post must be at least 10 characters" }, { status: 400 });
      }

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const post = await CommunityPost.create({
        authorId: payload.userId,
        authorName: body.authorName || "Anonymous",
        authorEmail: body.authorEmail || "",
        authorAvatar: body.authorAvatar || "",
        content: content.trim(),
        expiresAt,
      });

      return NextResponse.json({ post }, { status: 201 });
    }

    if (type === "chat") {
      const { content } = body;

      if (!content || content.trim().length < 1) {
        return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
      }

      const message = await CommunityChat.create({
        authorId: payload.userId,
        authorName: body.authorName || "Anonymous",
        authorEmail: body.authorEmail || "",
        authorAvatar: body.authorAvatar || "",
        content: content.trim(),
      });

      return NextResponse.json({ message }, { status: 201 });
    }

    if (type === "like") {
      const { postId } = body;
      const post = await CommunityPost.findById(postId);

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      const userId = payload.userId;
      const likeIndex = post.likes.indexOf(userId);

      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
      } else {
        post.likes.push(userId);
      }

      await post.save();

      return NextResponse.json({ likes: post.likes.length, liked: likeIndex === -1 });
    }

    if (type === "pin") {
      const { postId } = body;
      const post = await CommunityPost.findById(postId);

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      post.isPinned = !post.isPinned;
      post.pinnedBy = post.isPinned ? payload.userId : undefined;
      await post.save();

      return NextResponse.json({ isPinned: post.isPinned });
    }

    if (type === "comment") {
      const { postId, content } = body;

      if (!content || content.trim().length < 1) {
        return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
      }

      const post = await CommunityPost.findById(postId);

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      post.comments.push({
        authorId: payload.userId,
        authorName: body.authorName || "Anonymous",
        authorEmail: body.authorEmail || "",
        authorAvatar: body.authorAvatar || "",
        content: content.trim(),
        createdAt: new Date(),
      });

      await post.save();

      return NextResponse.json({ comment: post.comments[post.comments.length - 1] }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error posting to community:", error);
    return NextResponse.json({ error: "Failed to post" }, { status: 500 });
  }
}