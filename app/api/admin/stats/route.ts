import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";
import { Comment } from "@/lib/models/comment.model";
import { verifyToken } from "@/lib/auth/jwt";
import { SESSION } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION.COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalComments,
      pendingComments,
      repliedComments,
      recentPosts,
      recentComments,
    ] = await Promise.all([
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ isPublished: true }),
      BlogPost.countDocuments({ isPublished: false }),
      Comment.countDocuments(),
      Comment.countDocuments({ isReplied: false }),
      Comment.countDocuments({ isReplied: true }),
      BlogPost.find().sort({ createdAt: -1 }).limit(7).select("createdAt").lean(),
      Comment.find().sort({ createdAt: -1 }).limit(7).select("createdAt").lean(),
    ]);

    const totalViews = await BlogPost.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const totalUpvotes = await BlogPost.aggregate([
      { $group: { _id: null, total: { $sum: "$upvotes" } } },
    ]);
    const totalDownvotes = await BlogPost.aggregate([
      { $group: { _id: null, total: { $sum: "$downvotes" } } },
    ]);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const postsLastWeek = recentPosts.filter(p => new Date(p.createdAt) >= sevenDaysAgo).length;
    const postsPrevWeek = recentPosts.filter(p => {
      const date = new Date(p.createdAt);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    }).length;

    const commentsLastWeek = recentComments.filter(c => new Date(c.createdAt) >= sevenDaysAgo).length;
    const commentsPrevWeek = recentComments.filter(c => {
      const date = new Date(c.createdAt);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    }).length;

    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return NextResponse.json({
      blog: {
        total: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
        totalViews: totalViews[0]?.total || 0,
        totalUpvotes: totalUpvotes[0]?.total || 0,
        totalDownvotes: totalDownvotes[0]?.total || 0,
        growth: calcGrowth(postsLastWeek, postsPrevWeek),
        postsLastWeek,
      },
      comments: {
        total: totalComments,
        pending: pendingComments,
        replied: repliedComments,
        growth: calcGrowth(commentsLastWeek, commentsPrevWeek),
        commentsLastWeek,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
