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

    const firstAdmin = await Admin.findOne().lean();
    const fallbackAvatar = firstAdmin?.avatar || "";
    
    const authorIds = [...new Set(posts.map(p => p.authorId).filter(Boolean))];
    const authors = await Admin.find({ _id: { $in: authorIds } }).lean();
    const authorMap = new Map(authors.map(a => [a._id.toString(), a.avatar || ""]));
    
    const allAdmins = await Admin.find().lean();
    const nameAvatarMap = new Map(allAdmins.map(a => [a.name.toLowerCase(), a.avatar || ""]));

    const postsWithAvatars = posts.map((post) => {
      let authorAvatar = "";
      if (post.authorId) {
        authorAvatar = authorMap.get(post.authorId) || "";
      }
      if (!authorAvatar && post.author) {
        authorAvatar = nameAvatarMap.get(post.author.toLowerCase()) || "";
      }
      if (!authorAvatar) {
        authorAvatar = fallbackAvatar;
      }
      return { ...post, authorAvatar };
    });

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
