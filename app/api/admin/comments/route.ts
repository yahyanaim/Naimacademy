import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Comment } from "@/lib/models/comment.model";
import { BlogPost } from "@/lib/models/blog-post.model";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const articleSlug = searchParams.get("articleSlug");

    await connectDB();

    const query = articleSlug ? { articleSlug } : {};
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query),
    ]);

    const uniqueSlugs = [...new Set(comments.map((c) => c.articleSlug))];
    const posts = await BlogPost.find({ slug: { $in: uniqueSlugs } }).lean();
    const postsMap = new Map(posts.map((p) => [p.slug, p]));

    const commentsWithVotes = comments.map((comment) => {
      const post = postsMap.get(comment.articleSlug);
      return {
        ...comment,
        upvotes: post?.upvotes || 0,
        downvotes: post?.downvotes || 0,
      };
    });

    return NextResponse.json({
      comments: commentsWithVotes,
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
