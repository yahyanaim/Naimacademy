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