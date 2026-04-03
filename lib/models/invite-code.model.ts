import mongoose, { Schema, Document } from "mongoose";

export interface IInviteCode extends Document {
  code: string;
  maxUses: number;
  usedCount: number;
}

const InviteCodeSchema = new Schema<IInviteCode>({
  code: { type: String, required: true, unique: true },
  maxUses: { type: Number, required: true, default: 500 },
  usedCount: { type: Number, required: true, default: 0 },
});

export const InviteCode =
  mongoose.models.InviteCode ||
  mongoose.model<IInviteCode>("InviteCode", InviteCodeSchema);
