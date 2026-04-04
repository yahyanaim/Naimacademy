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

    const invite = await InviteCode.findOneAndUpdate(
      { code: inviteCode, $expr: { $lt: ["$usedCount", "$maxUses"] } },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error("[SIGNUP_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}