import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail, generateResetPasswordEmail } from "@/lib/email";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const forgotAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_FORGOT_ATTEMPTS = 3;
const FORGOT_WINDOW_MS = 900000;

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}

function checkForgotRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = `forgot:${ip}`;
  const entry = forgotAttempts.get(key);

  if (!entry || now > entry.resetAt) {
    forgotAttempts.set(key, { count: 1, resetAt: now + FORGOT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_FORGOT_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = checkForgotRateLimit(ip);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Too many password reset attempts. Try again in ${limit.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: parsed.data.email });
    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { message: "If an account with that email exists, a password reset link has been sent." },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000);

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://naimacademy.vercel.app"}/reset-password/${resetToken}`;

    const emailHtml = generateResetPasswordEmail(resetUrl, user.name);
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Naim Academy",
      html: emailHtml,
    });

    return NextResponse.json(
      { message: "If an account with that email exists, a password reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
