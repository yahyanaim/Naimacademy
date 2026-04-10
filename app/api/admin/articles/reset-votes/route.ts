import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";
import { verifyToken } from "@/lib/auth/jwt";
import { SESSION } from "@/lib/constants";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION.COOKIE_NAME)?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  
  return payload;
}

function recalculateVotes(post: any) {
  const votesObj = post.votes || {};
  let upvotes = 0;
  let downvotes = 0;
  for (const v of Object.values(votesObj)) {
    if (v === "up") upvotes++;
    else if (v === "down") downvotes++;
  }
  post.upvotes = upvotes;
  post.downvotes = downvotes;
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const body = await req.json();
    const { slug, recalculate } = body;

    if (recalculate) {
      const posts = await BlogPost.find({}).lean();
      for (const post of posts) {
        recalculateVotes(post);
        await BlogPost.updateOne({ _id: post._id }, { 
          upvotes: post.upvotes, 
          downvotes: post.downvotes,
          votes: post.votes 
        });
      }
      return NextResponse.json({ success: true, message: "All votes recalculated" });
    }

    if (slug) {
      await BlogPost.updateOne(
        { slug },
        { 
          upvotes: 0, 
          downvotes: 0, 
          votes: {},
          votedBy: [] 
        }
      );
      return NextResponse.json({ success: true, message: `Votes reset for article: ${slug}` });
    } else {
      await BlogPost.updateMany(
        {}, 
        { 
          upvotes: 0, 
          downvotes: 0, 
          votes: {},
          votedBy: [] 
        }
      );
      return NextResponse.json({ success: true, message: "All votes reset" });
    }
  } catch (error) {
    console.error("Error resetting votes:", error);
    return NextResponse.json({ error: "Failed to reset votes" }, { status: 500 });
  }
}
