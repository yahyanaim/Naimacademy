import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: "new_user" | "course_completed" | "certificate" | "general";
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["new_user", "course_completed", "certificate", "general"], 
    default: "general" 
  },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = 
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
