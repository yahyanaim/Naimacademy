"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Clock, Eye, Search, X } from "lucide-react";

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  views: number;
  coverImage?: string;
  tags: string[];
}

export default function ArticlesSearch() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/blog?limit=100");
        if (res.ok) {
          const data = await res.json();
          setArticles(data.posts || []);
          setFilteredArticles(data.posts || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArticles(articles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          article.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
      setFilteredArticles(filtered);
    }
  }, [searchQuery, articles]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-muted rounded-full animate-pulse" />
        <div className="grid gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-3 border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {filteredArticles.length} result{filteredArticles.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="size-10 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {searchQuery ? "No articles found" : "No articles yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : "Check back soon for new content"}
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {filteredArticles.map((article) => (
            <article key={article._id} className="group">
              <div className="flex gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        {article.author?.charAt(0) || "N"}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{article.author}</span>
                    <span className="text-muted-foreground">·</span>
                    <time className="text-sm text-muted-foreground">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </time>
                  </div>

                  <Link href={`/blog/${article.slug}`} className="block">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center gap-4">
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-2">
                          {article.tags.slice(0, 2).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {article.readingTime} min read
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="size-3" />
                        {article.views || 0} views
                      </span>
                    </div>
                  </Link>
                </div>

                {article.coverImage && (
                  <div className="hidden sm:block w-36 h-28 flex-shrink-0">
                    <div className="relative overflow-hidden rounded-xl h-full">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
