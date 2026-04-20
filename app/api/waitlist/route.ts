import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";

export const dynamic = "force-dynamic";

const corsHeaders = { "Access-Control-Allow-Origin": "*" };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, country, education, interest, motivation } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!name || !email || !education || !interest) {
      return NextResponse.json(
        { error: "Required fields: name, email, education, interest" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers: corsHeaders }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "You've already applied!" },
        { status: 400, headers: corsHeaders }
      );
    }

    await User.create({
      name,
      email: email.toLowerCase(),
      country: country || "",
      role: "student",
      education,
      skillsInterest: interest,
      motivation: motivation || "",
      isWaitlisted: true,
    });

    return NextResponse.json(
      { success: true, message: "Application submitted!" },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("Waitlist error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to submit application", details: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}