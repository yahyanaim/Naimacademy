import { connectDB } from "@/lib/db/mongoose";
import { SupportMessage } from "@/lib/models/support-message.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = withAdmin(
  async () => {
    try {
      await connectDB();

      const messages = await SupportMessage.find()
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ messages }, { status: 200 });
    } catch (error) {
      console.error("[GET /api/admin/support]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

const replySchema = z.object({
  messageId: z.string().min(1),
  message: z.string().min(1).max(1000),
});

export const POST = withAdmin(
  async (req: NextRequest) => {
    try {
      await connectDB();

      const body = await req.json();
      const parsed = replySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      const original = await SupportMessage.findById(parsed.data.messageId);
      if (!original) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
      }

      await SupportMessage.create({
        userId: original.userId,
        userName: "Admin",
        userEmail: "",
        message: parsed.data.message,
        isAdmin: true,
      });

      return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
      console.error("[POST /api/admin/support]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
