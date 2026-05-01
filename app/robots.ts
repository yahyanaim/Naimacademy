import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog/", "/course/", "/community/"],
      disallow: ["/api/", "/admin/"],
    },
    sitemap: "https://naimacademy.com/sitemap.xml",
  };
}