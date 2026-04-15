import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICommunityPost extends Document {
  authorId: Types.ObjectId;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  pinnedBy?: Types.ObjectId;
  expiresAt: Date;
  isExpired: boolean;
  likes: Types.ObjectId[];
  saved: Types.ObjectId[];
  comments: {
    authorId: Types.ObjectId;
    authorName: string;
    authorEmail: string;
    authorAvatar?: string;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    authorAvatar: { type: String, default: "" },
    content: { type: String, required: true },
    tags: [{ type: String, default: [] }],
    isPinned: { type: Boolean, default: false, index: true },
    pinnedBy: { type: Schema.Types.ObjectId, ref: "User" },
    expiresAt: { type: Date, required: true, index: true },
    isExpired: { type: Boolean, default: false },
    likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    saved: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    comments: [
      {
        authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        authorName: { type: String, required: true },
        authorEmail: { type: String, required: true },
        authorAvatar: { type: String, default: "" },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

CommunityPostSchema.index({ createdAt: -1 });
CommunityPostSchema.index({ isPinned: -1, createdAt: -1 });
CommunityPostSchema.index({ tags: 1 });

export const CommunityPost =
  mongoose.models.CommunityPost || mongoose.model<ICommunityPost>("CommunityPost", CommunityPostSchema);