import mongoose, { Schema, Document, Types } from "mongoose";
import { EXAM } from "@/lib/constants";

export interface IExam extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: Types.ObjectId[];
}

const ExamSchema = new Schema<IExam>({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  passingScore: { type: Number, default: EXAM.DEFAULT_PASSING_SCORE },
  timeLimitMinutes: { type: Number, default: EXAM.DEFAULT_TIME_LIMIT_MINUTES },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
});

export const Exam =
  mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);
