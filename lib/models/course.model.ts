import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  thumbnail: string;
  sections: Types.ObjectId[];
  totalLessons: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    sections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
    totalLessons: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Course =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
