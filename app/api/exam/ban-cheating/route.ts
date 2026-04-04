import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const banSchema = z.object({
  examId: z.string().min(1),
});

export const POST = withAuth(
  async (req: NextRequest, ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }) => {
    try {
      await connectDB();

      const body = await req.json();
      const parsed = banSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      await User.findByIdAndUpdate(ctx.user.userId, {
        $set: {
          isBanned: true,
          banReason: "Account banned for cheating during exam (left exam page 2 times)",
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("[POST /api/exam/ban-cheating]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
