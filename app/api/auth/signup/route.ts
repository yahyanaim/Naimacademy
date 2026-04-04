import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { InviteCode } from "@/lib/models/invite-code.model";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { PASSWORD } from "@/lib/constants";
import { sanitizeInput } from "@/lib/utils/sanitize";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").transform((val) => sanitizeInput(val)),
  email: z.string().email("Invalid email address").transform((val) => sanitizeInput(val).toLowerCase()),
  password: z.string().min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`),
  inviteCode: z.string().min(1, "Invite code is required").transform((val) => sanitizeInput(val)),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, inviteCode } = parsed.data;

    await connectDB();

    const invite = await InviteCode.findOne({ code: inviteCode });
    if (!invite || invite.usedCount >= invite.maxUses) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }
    invite.usedCount += 1;
    await invite.save();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await InviteCode.findByIdAndUpdate(invite._id, { $inc: { usedCount: -1 } });
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, PASSWORD.BCRYPT_ROUNDS);
    const user = await User.create({ name, email, password: hashedPassword });

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

    return response;
  } catch (error: unknown) {
    console.error("[SIGNUP_ERROR]", error);
    const err = error as Error & { code?: number };
    if (err.code === 11000 && err.message?.includes("certifications.certificationId")) {
      try {
        const mongoose = await import("mongoose");
        const db = mongoose.connection.db;
        await db.collection("users").dropIndex("certifications.certificationId_1");
        console.log("[SIGNUP] Dropped stale certification index, retry signup");
        return NextResponse.json(
          { error: "Please try again" },
          { status: 500 }
        );
      } catch (dropError) {
        console.error("[SIGNUP] Failed to drop index:", dropError);
      }
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}