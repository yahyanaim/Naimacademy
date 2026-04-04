import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectDB();

    const email = "testuser@test.com";
    const password = "password123";

    await User.deleteOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: "Test User",
      email,
      password: hashedPassword,
      role: "user",
    });

    return NextResponse.json({ 
      success: true, 
      email: user.email,
      password: password,
      role: user.role 
    });
  } catch (error) {
    console.error("[CREATE_TEST_USER]", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}