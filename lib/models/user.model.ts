import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "student";
  isBanned: boolean;
  banReason?: string;
  lastActivityAt: Date;
  progress: {
    completedLessons: Types.ObjectId[];
    completionPercentage: number;
    lastLessonId?: Types.ObjectId;
    lastVideoTimestamp: number;
  };
  learningSchedule: {
    lessonsPerWeek: number;
    daysOfWeek: number[];
    startDate: Date;
    endDate: Date;
  } | null;
  examAttempts: {
    examId: string;
    examTitle: string;
    score: number;
    passed: boolean;
    total: number;
    correct: number;
    answers: number[];
    submittedAt: Date;
  }[];
  certifications: {
    certificationId: string;
    examId: string;
    examTitle: string;
    courseId: string;
    courseTitle: string;
    studentName: string;
    score: number;
    issuedAt: Date;
  }[];
  certificateIssued: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student"], default: "student" },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
    lastActivityAt: { type: Date, default: Date.now },
    progress: {
      completedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
      completionPercentage: { type: Number, default: 0 },
      lastLessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
      lastVideoTimestamp: { type: Number, default: 0 },
    },
    learningSchedule: {
      lessonsPerWeek: { type: Number },
      daysOfWeek: [{ type: Number }],
      startDate: { type: Date },
      endDate: { type: Date },
    },
    examAttempts: [
      {
        examId: { type: String, required: true, index: true },
        examTitle: { type: String, required: true },
        score: { type: Number, required: true },
        passed: { type: Boolean, required: true },
        total: { type: Number, required: true },
        correct: { type: Number, required: true },
        answers: [{ type: Number, required: true }],
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    certifications: [
      {
        certificationId: { type: String },
        examId: { type: String, required: true },
        examTitle: { type: String, required: true },
        courseId: { type: String, required: true },
        courseTitle: { type: String, required: true },
        studentName: { type: String, required: true },
        score: { type: Number, required: true },
        issuedAt: { type: Date, default: Date.now },
      },
    ],
    certificateIssued: { type: Boolean, default: false },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
