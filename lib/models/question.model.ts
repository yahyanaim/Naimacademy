import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  examId: Types.ObjectId;
  type: "multiple-choice" | "true-false";
  question: string;
  options: string[];
  correctAnswer: number;
  notes?: string;
  order: number;
}

const QuestionSchema = new Schema<IQuestion>({
  examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  type: {
    type: String,
    enum: ["multiple-choice", "true-false"],
    required: true,
  },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  notes: { type: String, default: "" },
  order: { type: Number, required: true },
});

export const Question =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);
