import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISection extends Document {
  _id: Types.ObjectId;
  title: string;
  order: number;
  courseId: Types.ObjectId;
  lessons: Types.ObjectId[];
}

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
});

export const Section =
  mongoose.models.Section ||
  mongoose.model<ISection>("Section", SectionSchema);
