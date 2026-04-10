import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { slug, vote, voterName, voterEmail } = body;
    
    if (!slug || !vote) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    
    if (vote !== "up" && vote !== "down") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }
    
    if (!voterEmail) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    
    const email = voterEmail.toLowerCase();
    
    const post = await BlogPost.findOne({ slug, isPublished: true });
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    let votesObj: Record<string, string> = {};
    if (post.votes && typeof post.votes === 'object') {
      votesObj = { ...post.votes } as Record<string, string>;
    }
    
    const previousVote = votesObj[email];
    
    if (previousVote === vote) {
      return NextResponse.json({ 
        error: "You have already voted for this",
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        userVote: vote
      }, { status: 400 });
    }
    
    votesObj[email] = vote;
    
    let upvotes = 0;
    let downvotes = 0;
    for (const v of Object.values(votesObj)) {
      if (v === "up") upvotes++;
      else if (v === "down") downvotes++;
    }
    
    post.upvotes = upvotes;
    post.downvotes = downvotes;
    post.votes = votesObj;
    
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
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const email = searchParams.get("email");
    
    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }
    
    const post = await BlogPost.findOne({ slug, isPublished: true }).lean();
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    let userVote = null;
    if (email) {
      const votesObj = (post as any).votes || {};
      userVote = votesObj[email.toLowerCase()] || null;
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
