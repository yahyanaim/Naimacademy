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
  let text = this.content;
  text = text.replace(/<[^>]*>/g, " ");
  text = text.replace(/[#*_`~\[\]()]/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const avgCharsPerWord = 5;
  const wpm = 200;
  const time = Math.max(1, Math.ceil((words * avgCharsPerWord) / (wpm * avgCharsPerWord)));
  this.readingTime = time;
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export const BlogPost =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
