import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { Admin } from "@/lib/models/admin.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ): Promise<NextResponse> => {
    try {
      await connectDB();

      if (ctx.user.role === "admin") {
        const admin = await Admin.findById(ctx.user.userId).select("-password");
        if (!admin) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(
          {
            user: {
              id: admin._id.toString(),
              name: admin.name,
              email: admin.email,
              role: "admin",
              examAttempts: [],
              certifications: [],
            },
          },
          { status: 200 }
        );
      }

      const user = await User.findById(ctx.user.userId).select("-password");
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (user.isBanned) {
        return NextResponse.json(
          { error: "Your account has been banned", reason: user.banReason },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isBanned: user.isBanned,
            examAttempts: user.examAttempts.map(
              (a: Record<string, unknown>) => ({
                score: a.score,
                passed: a.passed,
                submittedAt: a.submittedAt,
                examTitle: a.examTitle,
              })
            ),
            certifications: user.certifications || [],
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("[ME]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
