import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Please login to vote" }, { status: 401 });
    }
    
    const body = await request.json();
    const { slug, vote } = body;
    
    if (!slug || !vote) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    
    if (vote !== "up" && vote !== "down" && vote !== "remove") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }
    
    const jwt = await import("jsonwebtoken");
    const secret = process.env.JWT_SECRET || "default-secret";
    const decoded = jwt.default.verify(token, secret) as { userId: string };
    const userId = decoded.userId;
    
    const post = await BlogPost.findOne({ slug, isPublished: true });
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    const hasVoted = post.votedBy.includes(userId);
    
    if (vote === "remove" && hasVoted) {
      const previousVote = post.votedBy.indexOf(userId);
      if (previousVote !== -1) {
        post.votedBy.splice(previousVote, 1);
        if (post.votes && post.votes[userId] === "up") {
          post.upvotes = Math.max(0, post.upvotes - 1);
        } else if (post.votes && post.votes[userId] === "down") {
          post.downvotes = Math.max(0, post.downvotes - 1);
        }
      }
      await post.save();
      return NextResponse.json({ 
        success: true, 
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        userVote: null
      });
    }
    
    if (hasVoted && vote !== "remove") {
      return NextResponse.json({ 
        error: "You have already voted. Remove your vote first.",
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        userVote: post.votes?.[userId] || null
      }, { status: 400 });
    }
    
    if (vote === "up") {
      post.upvotes += 1;
      post.votedBy.push(userId);
    } else if (vote === "down") {
      post.downvotes += 1;
      post.votedBy.push(userId);
    }
    
    await post.save();
    
    return NextResponse.json({ 
      success: true, 
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      userVote: vote === "remove" ? null : vote
    });
    
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json(
      { error: "Failed to vote" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    
    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }
    
    const post = await BlogPost.findOne({ slug, isPublished: true }).lean();
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    let userVote = null;
    if (token) {
      try {
        const jwt = await import("jsonwebtoken");
        const secret = process.env.JWT_SECRET || "default-secret";
        const decoded = jwt.default.verify(token, secret) as { userId: string };
        const userId = decoded.userId;
        userVote = (post as any).votedBy?.includes(userId) ? "voted" : null;
      } catch {
        // Invalid token, ignore
      }
    }
    
    return NextResponse.json({ 
      upvotes: (post as any).upvotes || 0,
      downvotes: (post as any).downvotes || 0,
      userVote
    });
    
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}
