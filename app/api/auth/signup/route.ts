import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { InviteCode } from "@/lib/models/invite-code.model";
import { Notification } from "@/lib/models/notification.model";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { PASSWORD } from "@/lib/constants";
import { sanitizeInput } from "@/lib/utils/sanitize";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generateVerificationEmail } from "@/lib/email";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").transform((val) => sanitizeInput(val)),
  email: z.string().email("Invalid email address").transform((val) => sanitizeInput(val).toLowerCase()),
  password: z.string().min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`),
  inviteCode: z.string().min(1, "Invite code is required").transform((val) => sanitizeInput(val)),
  termsAccepted: z.boolean().refine((val) => val === true, "You must accept the terms"),
});

const signupAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_SIGNUP_ATTEMPTS = 5;
const SIGNUP_WINDOW_MS = 3600000;

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}

function checkSignupRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = `signup:${ip}`;
  const entry = signupAttempts.get(key);

  if (!entry || now > entry.resetAt) {
    signupAttempts.set(key, { count: 1, resetAt: now + SIGNUP_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_SIGNUP_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkSignupRateLimit(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many signup attempts. Try again in ${limit.retryAfter} seconds.` },
      { status: 429 }
    );
  }

  const body = await req.json();

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, password, inviteCode, termsAccepted } = parsed.data;

  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 400 }
    );
  }

  const invite = await InviteCode.findOne({ code: inviteCode });
  if (!invite || invite.usedCount >= invite.maxUses) {
    return NextResponse.json(
      { error: "Invalid or expired invite code" },
      { status: 400 }
    );
  }
  invite.usedCount += 1;
  await invite.save();

  const hashedPassword = await bcrypt.hash(password, PASSWORD.BCRYPT_ROUNDS);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    termsAcceptedAt: termsAccepted ? new Date() : undefined,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  });

  const token = await signToken({ userId: user._id.toString(), role: user.role });

  const response = NextResponse.json(
    {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 201 }
  );
  setSessionCookie(response, token);

  // Create notification for new user
  await Notification.create({
    userId: user._id,
    title: "Welcome to Naim Academy!",
    message: "Welcome to Naim Academy! Start your n8n automation journey today.",
    type: "new_user",
  });

  // Send verification email (non-blocking - don't fail registration if email fails)
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://naimacademy.vercel.app"}/api/auth/verify-email?token=${verificationToken}`;
  const emailHtml = generateVerificationEmail(verifyUrl, name);
  
  try {
    await sendEmail({
      to: email,
      subject: "Verify Your Email - Naim Academy",
      html: emailHtml,
    });
    console.log(`[SIGNUP] Verification email sent to ${email}`);
  } catch (emailError) {
    console.error(`[SIGNUP] Failed to send verification email to ${email}:`, emailError);
  }

  return response;
}
