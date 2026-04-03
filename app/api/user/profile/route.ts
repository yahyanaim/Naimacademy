import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { User as UserModel } from "@/lib/models/user.model";
import { connectDB } from "@/lib/db/mongoose";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password } = await req.json();
    await connectDB();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await UserModel.findByIdAndUpdate(
      session.userId,
      updateData,
      { new: true }
    ).select("-password -__v");
    
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
