import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const user = await User.findById(ctx.user.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const cert = user.certifications?.[0];
      if (!cert) {
        return NextResponse.json(
          { error: "No certificate found" },
          { status: 404 }
        );
      }

      const baseUrl = req.nextUrl.origin;
      return NextResponse.redirect(
        new URL(`/certificate/${cert.certificationId}?download=true`, baseUrl)
      );
    } catch (error) {
      console.error("[GET /api/certificate/download]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
