import { connectDB } from "@/lib/db/mongoose";
import { InviteCode } from "@/lib/models/invite-code.model";
import { withAdmin } from "@/lib/auth/guards";
import { INVITE_CODE } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAdmin(
  async (req: NextRequest) => {
    try {
      await connectDB();

      const body = await req.json();
      const code = (body.code || process.env.DEFAULT_INVITE_CODE || "NAIM2026").toUpperCase();
      const maxUses = body.maxUses ?? INVITE_CODE.DEFAULT_MAX_USES;

      const existing = await InviteCode.findOne({ code });
      if (existing) {
        return NextResponse.json({
          code,
          usedCount: existing.usedCount,
          maxUses: existing.maxUses,
          message: "Invite code already exists"
        });
      }

      const invite = await InviteCode.create({ code, maxUses, usedCount: 0 });

      return NextResponse.json({
        code: invite.code,
        created: true,
        message: "Invite code created successfully"
      });
    } catch (error) {
      console.error("[CREATE_INVITE]", error);
      return NextResponse.json({ error: "Failed to create invite code" }, { status: 500 });
    }
  }
);

export const GET = withAdmin(
  async () => {
    try {
      await connectDB();

      const invites = await InviteCode.find().sort({ createdAt: -1 }).limit(50);

      return NextResponse.json({ invites });
    } catch (error) {
      console.error("[GET_INVITES]", error);
      return NextResponse.json({ error: "Failed to get invite codes" }, { status: 500 });
    }
  }
);
