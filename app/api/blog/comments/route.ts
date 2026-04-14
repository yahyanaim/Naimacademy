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

const MAX_LIMIT = 100;

async function getAvatarsBatch(emails: string[]): Promise<Map<string, string>> {
  const avatarMap = new Map<string, string>();
  
  const uniqueEmails = [...new Set(emails.map(e => e.toLowerCase()))];
  if (uniqueEmails.length === 0) return avatarMap;

  const [users, admins] = await Promise.all([
    User.find({ email: { $in: uniqueEmails } }).select("email avatar").lean(),
    Admin.find({ email: { $in: uniqueEmails } }).select("email avatar").lean(),
  ]);

  users.forEach(user => {
    if (user.email && user.avatar) {
      avatarMap.set(user.email.toLowerCase(), user.avatar);
    }
  });

  admins.forEach(admin => {
    if (admin.email && admin.avatar && !avatarMap.has(admin.email.toLowerCase())) {
      avatarMap.set(admin.email.toLowerCase(), admin.avatar);
    }
  });

  return avatarMap;
}

async function checkForDuplicate(
  articleSlug: string,
  authorEmail: string,
  content: string
): Promise<boolean> {
  const oneMinuteAgo = new Date(Date.now() - 60000);
  const existing = await Comment.findOne({
    articleSlug,
    authorEmail: authorEmail.toLowerCase(),
    content,
    createdAt: { $gte: oneMinuteAgo },
  });
  return !!existing;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), MAX_LIMIT);
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

    const emailsNeedingAvatar = comments
      .filter(c => !c.authorAvatar)
      .map(c => c.authorEmail);
    
    const avatarMap = await getAvatarsBatch(emailsNeedingAvatar);

    const commentsWithAvatars = comments.map(comment => {
      const authorAvatar = comment.authorAvatar || avatarMap.get(comment.authorEmail.toLowerCase()) || "";
      return { ...comment, authorAvatar };
    });

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
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const isDuplicate = await checkForDuplicate(
      parsed.data.articleSlug,
      parsed.data.authorEmail,
      parsed.data.content
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: "Duplicate comment detected. Please wait before posting again." },
        { status: 400 }
      );
    }
    
    const authorAvatar = await getAvatarsBatch([parsed.data.authorEmail])
      .then(m => m.get(parsed.data.authorEmail.toLowerCase()) || "");
    
    const comment = await Comment.create({
      ...parsed.data,
      authorEmail: parsed.data.authorEmail.toLowerCase(),
      authorAvatar,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}