import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Comment } from "@/lib/models/comment.model";
import { z } from "zod";

const createCommentSchema = z.object({
  articleSlug: z.string().min(1),
  articleTitle: z.string().min(1),
  authorName: z.string().min(2, "Name must be at least 2 characters"),
  authorEmail: z.string().email("Invalid email address"),
  content: z.string().min(10, "Comment must be at least 10 characters"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }

    await connectDB();
    
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      Comment.find({ articleSlug: slug })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ articleSlug: slug }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();
    const comment = await Comment.create(parsed.data);

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
