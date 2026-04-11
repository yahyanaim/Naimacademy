import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICommunityChatMessage extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const CommunityChatMessageSchema = new Schema<ICommunityChatMessage>({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

CommunityChatMessageSchema.index({ courseId: 1, createdAt: -1 });

export const CommunityChatMessage =
  mongoose.models.CommunityChatMessage || mongoose.model<ICommunityChatMessage>("CommunityChatMessage", CommunityChatMessageSchema);
