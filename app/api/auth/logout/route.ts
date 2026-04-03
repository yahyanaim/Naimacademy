import { clearSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    await clearSession();

    return response;
  } catch (error) {
    console.error("[LOGOUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
