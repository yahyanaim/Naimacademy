import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";
import { Admin } from "@/lib/models/admin.model";
import { withAdmin } from "@/lib/auth/guards";

function calculateReadingTime(content: string): number {
  const textOnly = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
  const words = textOnly.split(/\s+/).filter(w => w.length > 0).length;
  const wpm = 150;
  return Math.max(1, Math.ceil(words / wpm));
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const migrate = searchParams.get("migrate") === "true";

    if (migrate) {
      const firstAdmin = await Admin.findOne().lean();
      if (firstAdmin) {
        await BlogPost.updateMany(
          { $or: [{ authorId: { $exists: false } }, { authorId: "" }] },
          { authorId: firstAdmin._id.toString() }
        );
      }
    }

    const posts = await BlogPost.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching admin blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const adminCtx = await withAdmin(async (req, ctx) => {
    try {
      await connectDB();
      const body = await req.json();
      const { title, excerpt, content, coverImage, tags, isPublished, author, titleStyle } = body;

      if (!title || !excerpt || !content) {
        return NextResponse.json(
          { error: "Title, excerpt, and content are required" },
          { status: 400 }
        );
      }

      const admin = await Admin.findById(ctx.user.userId).lean();

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

      const readingTime = calculateReadingTime(content || "");

      const post = await BlogPost.create({
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImage || "",
        tags: tags || [],
        author: author || admin?.name || "Naim Academy",
        authorId: ctx.user.userId,
        titleStyle: titleStyle || "h1",
        isPublished: isPublished ?? true,
        publishedAt: isPublished ? new Date() : undefined,
        readingTime,
      });

      return NextResponse.json(post, { status: 201 });
    } catch (error) {
      console.error("Error creating blog post:", error);
      return NextResponse.json(
        { error: "Failed to create blog post" },
        { status: 500 }
      );
    }
  })(req, { params: Promise.resolve({}) });

  return adminCtx;
}

export async function PUT(req: NextRequest) {
  const adminCtx = await withAdmin(async (req, ctx) => {
    try {
      await connectDB();
      const body = await req.json();
      const { id, title, excerpt, content, coverImage, tags, isPublished, author, titleStyle } = body;

      if (!id) {
        return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
      }

      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (content !== undefined) {
        updateData.content = content;
        updateData.readingTime = calculateReadingTime(content);
      }
      if (coverImage !== undefined) updateData.coverImage = coverImage;
      if (tags !== undefined) updateData.tags = tags;
      if (author !== undefined) updateData.author = author;
      if (titleStyle !== undefined) updateData.titleStyle = titleStyle;
      updateData.authorId = ctx.user.userId;
      if (isPublished !== undefined) {
        updateData.isPublished = isPublished;
        if (isPublished) updateData.publishedAt = new Date();
      }

      const post = await BlogPost.findByIdAndUpdate(id, updateData, { new: true });

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      return NextResponse.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      return NextResponse.json(
        { error: "Failed to update blog post" },
        { status: 500 }
      );
    }
  })(req, { params: Promise.resolve({}) });

  return adminCtx;
}

export async function DELETE(req: NextRequest) {
  const adminCtx = await withAdmin(async (req, ctx) => {
    try {
      await connectDB();
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

      if (!id) {
        return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
      }

      await BlogPost.findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      return NextResponse.json(
        { error: "Failed to delete blog post" },
        { status: 500 }
      );
    }
  })(req, { params: Promise.resolve({}) });

  return adminCtx;
}
