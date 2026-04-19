import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, country, role, interest, motivation } = body;

    if (!name || !email || !role || !interest) {
      return NextResponse.json({ error: "Required fields: name, email, role, interest" }, { status: 400 });
    }

    await connectDB();

    // Check if already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "You've already applied!" }, { status: 400 });
    }

    // Create waitlist entry
    const user = await User.create({
      name,
      email,
      country: country || "",
      role,
      skillsInterest: interest,
      motivation,
      isWaitlisted: true,
    });

    return NextResponse.json({ success: true, message: "Application submitted!" }, { status: 201 });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}