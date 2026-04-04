import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/utils/sanitize";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").transform((val) => sanitizeInput(val).toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    console.log("[LOGIN] Attempting login for:", email);

    await connectDB();
    console.log("[LOGIN] DB connected");

    const user = await User.findOne({ email }).select("+password");
    console.log("[LOGIN] User found:", user ? "yes" : "no", user?.role);

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] Password match:", isMatch);

    if (!isMatch) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signToken({ userId: user._id.toString(), role: user.role });
    console.log("[LOGIN] Token created for role:", user.role);

    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    setSessionCookie(response, token);
    console.log("[LOGIN] Cookie set, returning success");

    return response;
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}