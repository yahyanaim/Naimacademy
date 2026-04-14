import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  articleSlug: string;
  articleTitle: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  isReplied: boolean;
  adminReply?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    articleSlug: { type: String, required: true, index: true },
    articleTitle: { type: String, required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true, index: true },
    authorAvatar: { type: String, default: "" },
    content: { type: String, required: true },
    isReplied: { type: Boolean, default: false, index: true },
    adminReply: { type: String, default: "" },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

CommentSchema.index({ articleSlug: 1, createdAt: -1 });
CommentSchema.index({ articleSlug: 1, isReplied: 1 });
CommentSchema.index({ authorEmail: 1 });
CommentSchema.index({ isReplied: 1, createdAt: -1 });

export const Comment =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
