import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILesson extends Document {
  _id: Types.ObjectId;
  title: string;
  videoUrl: string;
  description: string;
  summary: string;
  explanation: string;
  images: string[];
  resources: { name: string; url: string }[];
  links: { name: string; url: string }[];
  sectionId: Types.ObjectId;
  order: number;
  duration: string;
  transcript: string;
  isLocked?: boolean;
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  description: { type: String, default: "" },
  summary: { type: String, default: "" },
  explanation: { type: String, default: "" },
  images: [{ type: String }],
  resources: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  links: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
  order: { type: Number, required: true },
  duration: { type: String, default: "0:00" },
  transcript: { type: String, default: "" },
  isLocked: { type: Boolean, default: false },
});

export const Lesson =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema);
