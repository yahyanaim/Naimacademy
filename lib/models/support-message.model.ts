import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISupportMessage extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userEmail: string;
  message: string;
  isAdmin: boolean;
  createdAt: Date;
}

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    message: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SupportMessageSchema.index({ userId: 1, createdAt: -1 });

export const SupportMessage =
  mongoose.models.SupportMessage || mongoose.model<ISupportMessage>("SupportMessage", SupportMessageSchema);
