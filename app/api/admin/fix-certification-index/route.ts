import { connectDB } from "@/lib/db/mongoose";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const result = await db.collection("users").dropIndex("certifications.certificationId_1");
    
    return NextResponse.json({ 
      success: true, 
      message: "Index dropped successfully",
      result 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("index not found")) {
      return NextResponse.json({ 
        success: true, 
        message: "Index already doesn't exist" 
      });
    }
    console.error("[DROP_INDEX_ERROR]", error);
    return NextResponse.json({ 
      error: message,
      success: false 
    }, { status: 500 });
  }
}