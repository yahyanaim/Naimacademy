import mongoose, { Schema, Document, Types } from "mongoose";

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
  passingScore: { type: Number, default: 70 },
  timeLimitMinutes: { type: Number, default: 30 },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
});

export const Exam =
  mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);
