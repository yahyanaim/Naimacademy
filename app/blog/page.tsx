import Link from "next/link";
import { FileText, Clock, Eye } from "lucide-react";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

async function getPosts() {
  try {
    await connectDB();
    const posts = await BlogPost.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();
    return posts;
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <>
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

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <FileText className="size-12 text-muted-foreground/50" />
              </div>
              <p className="text-xl font-medium text-muted-foreground mb-2">No articles yet</p>
              <p className="text-sm text-muted-foreground">
                Check back soon for new content
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {featuredPost && (
                <article className="group">
                  <Link href={`/blog/${featuredPost.slug}`} className="block">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="order-2 md:order-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {featuredPost.author?.charAt(0) || "N"}
                            </span>
                          </div>
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
                                <span
                                  key={tag}
                                  className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                                >
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
                            <img
                              src={featuredPost.coverImage}
                              alt={featuredPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
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
                      <article key={post._id.toString()} className="group">
                        <div className="flex gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {post.author?.charAt(0) || "N"}
                                </span>
                              </div>
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
                                <img
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
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
      </main>
      <Footer />
    </>
  );
}
