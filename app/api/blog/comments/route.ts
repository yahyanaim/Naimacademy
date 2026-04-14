import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Comment } from "@/lib/models/comment.model";
import { User } from "@/lib/models/user.model";
import { Admin } from "@/lib/models/admin.model";
import { z } from "zod";

const createCommentSchema = z.object({
  articleSlug: z.string().min(1),
  articleTitle: z.string().min(1),
  authorName: z.string().min(2, "Name must be at least 2 characters"),
  authorEmail: z.string().email("Invalid email address"),
  content: z.string().min(10, "Comment must be at least 10 characters"),
});

async function getAvatarByEmail(email: string): Promise<string> {
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  if (user?.avatar) return user.avatar;
  
  const admin = await Admin.findOne({ email: email.toLowerCase() }).lean();
  if (admin?.avatar) return admin.avatar;
  
  return "";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const filter = searchParams.get("filter") || "all";

    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }

    await connectDB();
    
    const baseQuery: Record<string, unknown> = { articleSlug: slug };
    if (filter === "pending") {
      baseQuery.isReplied = false;
    } else if (filter === "replied") {
      baseQuery.isReplied = true;
    }
    
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      Comment.find(baseQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(baseQuery),
    ]);

    const commentsWithAvatars = await Promise.all(
      comments.map(async (comment) => {
        const authorAvatar = comment.authorAvatar || await getAvatarByEmail(comment.authorEmail);
        return { ...comment, authorAvatar };
      })
    );

    return NextResponse.json({
      comments: commentsWithAvatars,
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
    
    const authorAvatar = await getAvatarByEmail(parsed.data.authorEmail);
    
    const comment = await Comment.create({
      ...parsed.data,
      authorAvatar,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
