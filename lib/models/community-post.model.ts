import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICommunityPost extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  likes: Types.ObjectId[];
  createdAt: Date;
  expiresAt: Date;
}

const CommunityPostSchema = new Schema<ICommunityPost>({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 500 },
  likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

CommunityPostSchema.index({ courseId: 1, createdAt: -1 });
CommunityPostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const CommunityPost =
  mongoose.models.CommunityPost || mongoose.model<ICommunityPost>("CommunityPost", CommunityPostSchema);
