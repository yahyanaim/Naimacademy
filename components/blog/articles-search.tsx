"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, Clock, Eye, Search, X } from "lucide-react";

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  readingTime: number;
  views: number;
  coverImage?: string;
  tags: string[];
}

interface ArticlesSearchProps {
  placeholder?: string;
}

export default function ArticlesSearch({ placeholder = "Search articles..." }: ArticlesSearchProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

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
      setShowSearch(false);
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
      setShowSearch(true);
    }
  }, [searchQuery, articles]);

  if (loading) {
    return (
      <div className="relative max-w-md mx-auto mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          disabled
          className="w-full pl-12 pr-12 py-3 border rounded-full bg-muted animate-pulse"
        />
      </div>
    );
  }

  const featuredPost = !showSearch && filteredArticles[0];
  const otherPosts = !showSearch ? filteredArticles.slice(1) : [];

  return (
    <div>
      <div className="relative max-w-md mx-auto mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-3 border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {showSearch ? (
        <div>
          <p className="text-sm text-muted-foreground mb-6">
            {filteredArticles.length} result{filteredArticles.length !== 1 ? "s" : ""} found
          </p>
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-base font-medium text-muted-foreground">No articles found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {filteredArticles.map((article) => (
                <article key={article._id} className="group">
                  <div className="flex gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        {article.authorAvatar ? (
                          <div className="size-8 rounded-full overflow-hidden flex-shrink-0">
                            <Image src={article.authorAvatar} alt={article.author} width={32} height={32} className="object-cover" />
                          </div>
                        ) : (
                          <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                              {article.author?.charAt(0) || "N"}
                            </span>
                          </div>
                        )}
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
                                <span key={tag} className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-md">
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
                          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-16">
          {featuredPost && (
            <article className="group">
              <Link href={`/blog/${featuredPost.slug}`} className="block">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="order-2 md:order-1">
                    <div className="flex items-center gap-3 mb-4">
                      {featuredPost.authorAvatar ? (
                        <div className="size-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={featuredPost.authorAvatar} alt={featuredPost.author} width={40} height={40} className="object-cover" />
                        </div>
                      ) : (
                        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {featuredPost.author?.charAt(0) || "N"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{featuredPost.author}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {featuredPost.publishedAt
                              ? new Date(featuredPost.publishedAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : ""}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {featuredPost.readingTime} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                      {featuredPost.tags && featuredPost.tags.length > 0 && (
                        <div className="flex gap-2">
                          {featuredPost.tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">Featured</span>
                    </div>
                  </div>
                  {featuredPost.coverImage && (
                    <div className="order-1 md:order-2">
                      <div className="relative overflow-hidden rounded-2xl aspect-[16/10]">
                        <img src={featuredPost.coverImage} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </article>
          )}

          {otherPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-lg font-semibold">More Articles</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
              </div>
              <div className="grid gap-8">
                {otherPosts.map((post) => (
                  <article key={post._id} className="group">
                    <div className="flex gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          {post.authorAvatar ? (
                            <div className="size-8 rounded-full overflow-hidden flex-shrink-0">
                              <Image src={post.authorAvatar} alt={post.author} width={32} height={32} className="object-cover" />
                            </div>
                          ) : (
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium text-muted-foreground">
                                {post.author?.charAt(0) || "N"}
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-medium">{post.author}</span>
                          <span className="text-muted-foreground">·</span>
                          <time className="text-sm text-muted-foreground">
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}
                          </time>
                        </div>
                        <Link href={`/blog/${post.slug}`} className="block">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4">
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex gap-2">
                                {post.tags.slice(0, 2).map((tag: string) => (
                                  <span key={tag} className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-md">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              {post.readingTime} min read
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="size-3" />
                              {post.views || 0} views
                            </span>
                          </div>
                        </Link>
                      </div>
                      {post.coverImage && (
                        <div className="hidden sm:block w-36 h-28 flex-shrink-0">
                          <div className="relative overflow-hidden rounded-xl h-full">
                            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
