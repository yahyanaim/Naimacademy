import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { withAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const banSchema = z.object({
  isBanned: z.boolean(),
});

export const PATCH = withAdmin(
  async (
    req: NextRequest,
    ctx
  ) => {
    try {
      await connectDB();

      const params = await ctx.params;
      const id = params.id;
      const body = await req.json();
      const parsed = banSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      const updateData: Record<string, unknown> = { isBanned: parsed.data.isBanned };
      if (parsed.data.isBanned) {
        updateData.banReason = "Manually banned by admin";
      } else {
        updateData.banReason = undefined;
      }

      await User.findByIdAndUpdate(id, { $set: updateData });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("[PATCH /api/admin/users/:id/ban]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
