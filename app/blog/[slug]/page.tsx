import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";

async function getPost(slug: string) {
  try {
    await connectDB();
    const post = await BlogPost.findOneAndUpdate(
      { slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
    return post;
  } catch {
    return null;
  }
}

async function getAllPosts() {
  try {
    await connectDB();
    const posts = await BlogPost.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean();
    return posts;
  } catch {
    return [];
  }
}

function renderMarkdown(content: string): string {
  let html = content;

  html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-8 mb-4">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>');

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code class=\"bg-muted px-1.5 py-0.5 rounded text-sm font-mono\">$1</code>");

  html = html.replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>');

  html = html.replace(/\n\n/g, '</p><p class="mb-4">');
  html = html.replace(/\n/g, "<br />");

  if (!html.startsWith("<")) {
    html = "<p class=\"mb-4\">" + html;
  }

  return html;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article Not Found" };

  return {
    title: `${post.title} - Naim Academy Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getPost(slug),
    getAllPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Naim Academy
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <article>
          {post.coverImage && (
            <div className="aspect-video rounded-lg overflow-hidden mb-10 bg-muted">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <header className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-3">
                {post.authorAvatar ? (
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="size-10 rounded-full"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {post.author?.charAt(0) || "N"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{post.author}</p>
                  <p className="text-sm">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }) : ""}{" "}
                    · {post.readingTime} min read
                  </p>
                </div>
              </div>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 mt-6">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs bg-muted rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
        </article>

        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-10 border-t">
            <h2 className="text-2xl font-bold mb-8">More Articles</h2>
            <div className="grid gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id.toString()}
                  href={`/blog/${relatedPost.slug}`}
                  className="group block p-6 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {relatedPost.excerpt}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {relatedPost.publishedAt ? new Date(relatedPost.publishedAt).toLocaleDateString() : ""} ·{" "}
                    {relatedPost.readingTime} min read
                  </p>
                </Link>
              ))}
            </div>
          </section>
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
