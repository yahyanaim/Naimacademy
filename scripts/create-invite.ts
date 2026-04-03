import { connectDB } from "@/lib/db/mongoose";
import { InviteCode } from "@/lib/models/invite-code.model";
import mongoose from "mongoose";

async function createInviteCode() {
  await connectDB();

  // Delete existing invite codes
  await InviteCode.deleteMany({});

  // Create a new invite code
  const invite = await InviteCode.create({
    code: "NAIM2026",
    maxUses: 500,
    usedCount: 0,
  });

  console.log("Invite code created:", invite);

  await mongoose.disconnect();
  process.exit(0);
}

createInviteCode().catch(console.error);