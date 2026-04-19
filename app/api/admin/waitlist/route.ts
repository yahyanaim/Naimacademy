import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    await connectDB();

    const query = { isWaitlisted: true };

    const total = await User.countDocuments(query);
    const entries = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name email education skillsInterest isWaitlisted createdAt")
      .lean();

    return NextResponse.json({
      entries,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Admin waitlist error:", error);
    return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 });
  }
}