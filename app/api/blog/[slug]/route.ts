import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";
import { Admin } from "@/lib/models/admin.model";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const post = await BlogPost.findOneAndUpdate(
      { slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let authorAvatar = "";
    let authorIdDebug = post.authorId || "no authorId";

    if (post.authorId) {
      console.log("[BLOG POST] Looking for admin with ID:", post.authorId);
      const admin = await Admin.findById(post.authorId).lean();
      console.log("[BLOG POST] Admin found:", admin ? "yes" : "no", "avatar:", admin?.avatar || "none");
      if (admin?.avatar) {
        authorAvatar = admin.avatar;
      }
    }

    if (!authorAvatar) {
      console.log("[BLOG POST] Using fallback - finding first admin");
      const firstAdmin = await Admin.findOne().lean();
      console.log("[BLOG POST] First admin avatar:", firstAdmin?.avatar || "none");
      if (firstAdmin?.avatar) {
        authorAvatar = firstAdmin.avatar;
      }
    }

    console.log("[BLOG POST] Final authorAvatar:", authorAvatar);

    return NextResponse.json({ ...post, authorAvatar });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}
