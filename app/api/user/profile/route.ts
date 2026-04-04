import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/models/user.model";
import { connectDB } from "@/lib/db/mongoose";
import { PASSWORD } from "@/lib/constants";
import { sanitizeInput } from "@/lib/utils/sanitize";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").optional().transform((val) => val ? sanitizeInput(val) : undefined),
  email: z.string().email("Invalid email address").optional().transform((val) => val ? sanitizeInput(val).toLowerCase() : undefined),
  password: z.string().min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const { name, email, password } = parsed.data;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: session.userId } });
      if (existing) {
        return NextResponse.json(
          { error: "Email is already in use by another account" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, PASSWORD.BCRYPT_ROUNDS);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      updateData,
      { new: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
