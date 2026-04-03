import { connectDB } from "@/lib/db/mongoose";
import { InviteCode } from "@/lib/models/invite-code.model";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectDB();

    const existing = await InviteCode.findOne({ code: "NAIM2026" });
    if (existing) {
      return NextResponse.json({ 
        code: "NAIM2026", 
        usedCount: existing.usedCount, 
        maxUses: existing.maxUses,
        message: "Invite code already exists" 
      });
    }

    const invite = await InviteCode.create({
      code: "NAIM2026",
      maxUses: 500,
      usedCount: 0,
    });

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

export async function GET() {
  try {
    await connectDB();

    const existing = await InviteCode.findOne({ code: "NAIM2026" });
    if (!existing) {
      return NextResponse.json({ exists: false, code: "NAIM2026" });
    }

    return NextResponse.json({ 
      exists: true,
      code: "NAIM2026",
      usedCount: existing.usedCount,
      maxUses: existing.maxUses 
    });
  } catch (error) {
    console.error("[GET_INVITE]", error);
    return NextResponse.json({ error: "Failed to get invite code" }, { status: 500 });
  }
}