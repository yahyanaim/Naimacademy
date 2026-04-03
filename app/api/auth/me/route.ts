import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ): Promise<NextResponse> => {
    try {
      await connectDB();

      const user = await User.findById(ctx.user.userId).select("-password");
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            examAttempts: user.examAttempts.map(
              (a: any) => ({
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
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
