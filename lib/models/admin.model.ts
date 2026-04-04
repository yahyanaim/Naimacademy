import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true }
);

export const Admin =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
