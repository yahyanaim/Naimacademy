import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICommunityChat extends Document {
  authorId: Types.ObjectId;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityChatSchema = new Schema<ICommunityChat>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    authorAvatar: { type: String, default: "" },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

CommunityChatSchema.index({ createdAt: -1 });

export const CommunityChat =
  mongoose.models.CommunityChat || mongoose.model<ICommunityChat>("CommunityChat", CommunityChatSchema);