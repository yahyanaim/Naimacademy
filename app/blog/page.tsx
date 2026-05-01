import type { Metadata } from "next";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ArticlesSearch from "@/components/blog/articles-search";

export const metadata: Metadata = {
  title: "Blog Articles - Naim Academy",
  description: "Insights, tutorials, and stories to help you learn and grow. Explore practical tech skills, AI automation, and n8n workflow content.",
  alternates: {
    canonical: "https://naimacademy.com/blog",
  },
  keywords: "n8n, automation, AI, tech skills, tutorials, workflow automation",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Blog Articles - Naim Academy",
  "description": "Insights, tutorials, and stories to help you learn and grow",
  "url": "https://naimacademy.com/blog",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Naim Academy",
    "url": "https://naimacademy.com",
  },
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1 pt-14">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Articles
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Insights, tutorials, and stories to help you learn and grow
            </p>
          </div>

          <ArticlesSearch />
        </div>
      </main>
      <Footer />
    </>
  );
}
