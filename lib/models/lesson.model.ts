import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILesson extends Document {
  _id: Types.ObjectId;
  title: string;
  videoUrl: string;
  description: string;
  resources: { name: string; url: string }[];
  sectionId: Types.ObjectId;
  order: number;
  duration: string;
  transcript: string;
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  description: { type: String, default: "" },
  resources: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
  order: { type: Number, required: true },
  duration: { type: String, default: "0:00" },
  transcript: { type: String, default: "" },
});

export const Lesson =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema);
