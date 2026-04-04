import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { Admin } from "@/lib/models/admin.model";
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

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getRateLimitKey(ip: string): string {
  return `login:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

function resetRateLimit(key: string) {
  loginAttempts.delete(key);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rateKey = getRateLimitKey(ip);
    const limit = checkRateLimit(rateKey);

    if (!limit.allowed) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${limit.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    await connectDB();

    let user = await Admin.findOne({ email });
    let role = "admin";

    if (!user) {
      user = await User.findOne({ email });
      role = "student";
    }

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    resetRateLimit(rateKey);

    const token = await signToken({ userId: user._id.toString(), role });

    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role,
        },
      },
      { status: 200 }
    );

    setSessionCookie(response, token);

    return response;
  } catch (error: unknown) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
