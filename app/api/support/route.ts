import { connectDB } from "@/lib/db/mongoose";
import { SupportMessage } from "@/lib/models/support-message.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MAX_MESSAGES = 5;

const supportSchema = z.object({
  message: z.string().min(1, "Message is required").max(1000, "Message too long"),
});

export const GET = withAuth(
  async (
    _req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const messages = await SupportMessage.find({ userId: ctx.user.userId })
        .sort({ createdAt: -1 })
        .limit(MAX_MESSAGES)
        .select("message isAdmin createdAt");

      const remaining = MAX_MESSAGES - (await SupportMessage.countDocuments({ userId: ctx.user.userId }));

      return NextResponse.json({
        messages: messages.reverse(),
        remaining: Math.max(0, remaining),
        limit: MAX_MESSAGES,
      }, { status: 200 });
    } catch (error) {
      console.error("[GET /api/support]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const POST = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const body = await req.json();
      const parsed = supportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      const count = await SupportMessage.countDocuments({ userId: ctx.user.userId });
      if (count >= MAX_MESSAGES) {
        return NextResponse.json(
          { error: `You have reached the maximum of ${MAX_MESSAGES} support messages` },
          { status: 429 }
        );
      }

      const message = await SupportMessage.create({
        userId: ctx.user.userId,
        userName: body.userName || "User",
        userEmail: body.userEmail || "",
        message: parsed.data.message,
        isAdmin: false,
      });

      const remaining = MAX_MESSAGES - (count + 1);

      return NextResponse.json({
        message: {
          id: message._id.toString(),
          message: message.message,
          isAdmin: message.isAdmin,
          createdAt: message.createdAt,
        },
        remaining: Math.max(0, remaining),
      }, { status: 201 });
    } catch (error) {
      console.error("[POST /api/support]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
