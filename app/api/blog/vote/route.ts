import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Please login to vote" }, { status: 401 });
    }
    
    const body = await request.json();
    const { slug, vote } = body;
    
    if (!slug || !vote) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    
    if (vote !== "up" && vote !== "down") {
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
    
    const votesMap = post.votes as Map<string, string>;
    const previousVote = votesMap.get(userId);
    
    if (previousVote === vote) {
      return NextResponse.json({ 
        error: "You have already voted for this",
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        userVote: vote
      }, { status: 400 });
    }
    
    if (previousVote === "up") {
      post.upvotes = Math.max(0, post.upvotes - 1);
    } else if (previousVote === "down") {
      post.downvotes = Math.max(0, post.downvotes - 1);
    } else {
      post.votedBy.push(userId);
    }
    
    if (vote === "up") {
      post.upvotes += 1;
    } else if (vote === "down") {
      post.downvotes += 1;
    }
    
    votesMap.set(userId, vote);
    
    await post.save();
    
    return NextResponse.json({ 
      success: true, 
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      userVote: vote
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
    const token = cookieStore.get("auth-token")?.value;
    
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
        const votesMap = (post as any).votes as Record<string, string> | undefined;
        userVote = votesMap?.[userId] || null;
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
