import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { InviteCode } from "@/lib/models/invite-code.model";
import { setSession } from "@/lib/auth/session";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  inviteCode: z.string().min(1, "Invite code is required"),
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

    // Validate invite code
    let invite = await InviteCode.findOne({ code: inviteCode });

    // Auto-seed the code on first use
    if (!invite) {
      if (inviteCode === "learn8n") {
        invite = await InviteCode.create({ code: "learn8n", maxUses: 500, usedCount: 0 });
      } else {
        return NextResponse.json(
          { error: "Invalid invite code" },
          { status: 403 }
        );
      }
    }

    if (invite.usedCount >= invite.maxUses) {
      return NextResponse.json(
        { error: "This invite code has reached its maximum number of uses (500 spots are full)" },
        { status: 403 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    // Increment invite code usage
    await InviteCode.findByIdAndUpdate(invite._id, { $inc: { usedCount: 1 } });

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

    await setSession({ userId: user._id.toString(), role: user.role });

    return response;
  } catch (error) {
    console.error("[SIGNUP]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
