import { connectDB } from "@/lib/db/mongoose";
import { seed } from "@/lib/seed";
import { InviteCode } from "@/lib/models/invite-code.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    await connectDB();

    const existingInvite = await InviteCode.findOne({ code: "NAIM2025" });
    
    return NextResponse.json({ 
      message: "POST with ?mode=create or ?mode=update",
      inviteCode: existingInvite ? "NAIM2025" : "none"
    });
  }
);

export const POST = withAdmin(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") === "update" ? "update" : "create";

    try {
      await seed(mode);
      return NextResponse.json({ success: true, message: `Database ${mode === "update" ? "updated" : "seeded"} successfully` });
    } catch (error) {
      console.error("POST /api/admin/seed error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);