import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { NextRequest, NextResponse } from "next/server";

const INACTIVITY_DAYS = 10;

export async function POST() {
  try {
    await connectDB();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - INACTIVITY_DAYS);

    const result = await User.updateMany(
      {
        role: "student",
        isBanned: false,
        lastActivityAt: { $lt: cutoffDate },
      },
      {
        $set: {
          isBanned: true,
          banReason: `Account banned due to ${INACTIVITY_DAYS} days of inactivity`,
        },
      }
    );

    return NextResponse.json({
      success: true,
      bannedCount: result.modifiedCount,
      cutoffDate: cutoffDate.toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[BAN_INACTIVE]", error);
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
