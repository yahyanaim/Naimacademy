import { connectDB } from "@/lib/db/mongoose";
import { seed } from "@/lib/seed";
import { InviteCode } from "@/lib/models/invite-code.model";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectDB();

    await seed();

    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error("POST /api/admin/seed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();

    const existingInvite = await InviteCode.findOne({ code: "NAIM2026" });
    
    return NextResponse.json({ 
      message: "POST to seed. Invite exists: " + !!existingInvite,
      inviteCode: existingInvite ? "NAIM2026" : "none"
    });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}