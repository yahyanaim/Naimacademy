import Link from "next/link";
import { FileText } from "lucide-react";

async function getPosts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blog?limit=20`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Naim Academy
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground">
            Insights, tutorials, and stories from Naim Academy
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
          <div className="space-y-10">
            {posts.map((post: {
              _id: string;
              slug: string;
              title: string;
              excerpt: string;
              coverImage?: string;
              author: string;
              publishedAt: string;
              readingTime: number;
              tags: string[];
            }) => (
              <article key={post._id} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.coverImage && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{post.author}</span>
                      <span>·</span>
                      <time>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                      <span>·</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                    <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {post.excerpt}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs bg-muted rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Naim Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
