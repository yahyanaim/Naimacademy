import mongoose, { Schema, Document } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  authorAvatar?: string;
  tags: string[];
  isPublished: boolean;
  readingTime: number;
  views: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    author: { type: String, required: true, default: "Naim Academy" },
    authorAvatar: { type: String, default: "" },
    tags: [{ type: String, default: [] }],
    isPublished: { type: Boolean, default: false },
    readingTime: { type: Number, default: 5 },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogPostSchema.pre("save", async function () {
  const words = this.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  this.readingTime = Math.ceil(words / 200);
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export const BlogPost =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
