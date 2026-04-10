import mongoose, { Schema, Document } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  titleStyle: "h1" | "h2" | "h3";
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
  upvotes: number;
  downvotes: number;
  votedBy: string[];
  votes: Record<string, string>;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    titleStyle: { type: String, enum: ["h1", "h2", "h3"], default: "h1" },
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
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    votedBy: [{ type: String }],
    votes: { type: Object, default: {} },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogPostSchema.pre("save", async function () {
  let text = this.content;
  text = text.replace(/[#*_`~\[\]()]/g, " ");
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const wpm = 100;
  this.readingTime = Math.max(1, Math.ceil(words / wpm));
  
  if (this.isNew && this.isPublished) {
    this.publishedAt = new Date();
  }
});

export const BlogPost =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
