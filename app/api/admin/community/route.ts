import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { CommunityPost } from "@/lib/models/community-post.model";
import { withAdmin } from "@/lib/auth/guards";

export const GET = withAdmin(
  async (req, ctx) => {
    try {
      await connectDB();
      
      const posts = await CommunityPost.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      return NextResponse.json({ posts });
    } catch (error) {
      console.error("Error fetching community posts:", error);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
  }
);