import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail, generateResetPasswordEmail } from "@/lib/email";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
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
