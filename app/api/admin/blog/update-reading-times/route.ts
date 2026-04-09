import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";

export async function POST() {
  try {
    await connectDB();
    
    const posts = await BlogPost.find({});
    
    let updated = 0;
    for (const post of posts) {
      let text = post.content;
      text = text.replace(/[#*_`~\[\]()]/g, " ");
      const words = text.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
      const wpm = 100;
      const readingTime = Math.max(1, Math.ceil(words / wpm));
      
      if (post.readingTime !== readingTime) {
        post.readingTime = readingTime;
        await post.save();
        updated++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      total: posts.length, 
      updated 
    });
  } catch (error) {
    console.error("Error updating reading times:", error);
    return NextResponse.json(
      { error: "Failed to update reading times" },
      { status: 500 }
    );
  }
}
