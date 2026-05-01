import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";

const BASE_URL = "https://naimacademy.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  try {
    await connectDB();
    const posts = await BlogPost.find({ isPublished: true })
      .select("slug updatedAt publishedAt")
      .lean();

    const blogPages: MetadataRoute.Sitemap = posts.map((post) => {
      const lastModified = post.updatedAt || post.publishedAt || new Date();
      return {
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(lastModified),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

    return [...staticPages, ...blogPages];
  } catch {
    return staticPages;
  }
}