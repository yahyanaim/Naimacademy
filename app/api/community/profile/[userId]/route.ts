import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { CommunityPost } from "@/lib/models/community-post.model";
import { User } from "@/lib/models/user.model";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    await connectDB();

    const user = await User.findById(userId).select("name email avatar role createdAt").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const posts = await CommunityPost.find({
      authorId: userId,
      isExpired: false,
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    const stats = {
      totalPosts: posts.length,
      totalComments: posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0),
      totalLikes: posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0),
      pinnedPosts: posts.filter(p => p.isPinned).length,
    };

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        role: user.role,
        createdAt: user.createdAt,
      },
      posts,
      stats,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}