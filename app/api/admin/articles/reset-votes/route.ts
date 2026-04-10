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

export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const body = await req.json();
    const { slug } = body;

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
