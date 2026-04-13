import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";
import { Admin } from "@/lib/models/admin.model";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const tag = searchParams.get("tag");

    const query: Record<string, unknown> = { isPublished: true };
    if (tag) {
      query.tags = tag;
    }

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    const postsWithAvatars = await Promise.all(
      posts.map(async (post) => {
        let authorAvatar = "";
        if (post.authorId) {
          const admin = await Admin.findById(post.authorId).lean();
          authorAvatar = admin?.avatar || "";
        }
        return { ...post, authorAvatar };
      })
    );

    return NextResponse.json({
      posts: postsWithAvatars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
