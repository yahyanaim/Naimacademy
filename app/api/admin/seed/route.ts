import { connectDB } from "@/lib/db/mongoose";
import { seed } from "@/lib/seed";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectDB();

    await seed();

    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error("POST /api/admin/seed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Send POST to seed database. Default admin: admin@n8n-course.com / admin123" 
  });
}