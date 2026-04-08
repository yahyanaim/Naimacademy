import Link from "next/link";
import { FileText } from "lucide-react";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";

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

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Naim Academy
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12 pb-8 border-b">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Articles</h1>
          <p className="text-lg text-muted-foreground">
            Thoughtful perspectives on learning and growth
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="size-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground text-lg">No articles yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for new content
            </p>
          </div>
        ) : (
          <div>
            {posts.map((post, index) => (
              <article key={post._id.toString()} className="group">
                <div className="flex gap-6 py-8 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {post.author?.charAt(0) || "N"}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {post.author}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <time className="text-sm text-muted-foreground">
                        {post.publishedAt 
                          ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </time>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">
                        {post.readingTime} min read
                      </span>
                    </div>
                    
                    <Link href={`/blog/${post.slug}`} className="block">
                      <h2 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary/70 transition-colors leading-tight">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2">
                          {post.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </div>
                  
                  {post.coverImage && (
                    <div className="hidden sm:block w-32 h-32 md:w-40 md:h-32 flex-shrink-0">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Naim Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
