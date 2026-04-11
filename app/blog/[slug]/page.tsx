import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { connectDB } from "@/lib/db/mongoose";
import { BlogPost } from "@/lib/models/blog-post.model";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ShareButtons from "@/components/blog/share-buttons";
import VoteButtons from "@/components/blog/vote-buttons";
import CommentsSection from "@/components/blog/comments-section";
import ListenButton from "@/components/blog/listen-button";
import TranslateSelection from "@/components/blog/translate-selection";

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

  html = html.replace(/^###### (.*$)/gm, '<h6 class="text-base font-semibold mt-6 mb-2">$1</h6>');
  html = html.replace(/^##### (.*$)/gm, '<h5 class="text-base font-semibold mt-6 mb-2">$1</h5>');
  html = html.replace(/^#### (.*$)/gm, '<h4 class="text-base font-semibold mt-6 mb-2">$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-6 mb-2">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h2 class="text-lg font-semibold mt-6 mb-2">$1</h2>');

  html = html.replace(/\!\[\]\((.*?)\)/g, '<img src="$1" alt="" class="rounded-lg border border-gray-300 shadow-md my-4 max-w-full" />');
  html = html.replace(/\!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-lg border border-gray-300 shadow-md my-4 max-w-full" />');

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code class=\"bg-muted px-1.5 py-0.5 rounded text-sm font-mono\">$1</code>");

  html = html.replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>');

  html = html.replace(/\n\n/g, '</p><p class="mb-4 text-sm leading-relaxed">');
  html = html.replace(/\n/g, "<br />");

  if (!html.startsWith("<")) {
    html = "<p class=\"mb-4 text-sm leading-relaxed\">" + html;
  }

  return html;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article Not Found" };

  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_BASE_URL 
      ? process.env.NEXT_PUBLIC_BASE_URL 
      : "https://naimacademy.com";
  const articleUrl = `${baseUrl}/blog/${slug}`;
  
  const ogParams = new URLSearchParams({
    title: post.title,
    excerpt: post.excerpt,
    author: post.author || "Naim Academy",
  });
  
  const ogImageUrl = post.coverImage 
    ? post.coverImage 
    : `${baseUrl}/api/og/blog?${ogParams.toString()}`;

  const publishedDate = post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString();
  const modifiedDate = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedDate;

  return {
    title: `${post.title} | Naim Academy`,
    description: post.excerpt,
    authors: [{ name: post.author || "Naim Academy" }],
    openGraph: {
      type: "article",
      url: articleUrl,
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
          type: post.coverImage ? "image/jpeg" : "image/png",
        },
      ],
      siteName: "Naim Academy",
      locale: "en_US",
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
      authors: [post.author || "Naim Academy"],
      tags: post.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
      creator: "@naimacademy",
    },
    other: {
      "article:published_time": publishedDate,
      "article:modified_time": modifiedDate,
      "article:author": post.author || "Naim Academy",
      "article:section": "Education",
      "fb:app_id": process.env.NEXT_PUBLIC_FB_APP_ID || "YOUR_FB_APP_ID",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_BASE_URL 
      ? process.env.NEXT_PUBLIC_BASE_URL 
      : "https://naimacademy.com";
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

  const publishedDate = post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString();
  const modifiedDate = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedDate;
  const articleUrl = `${baseUrl}/blog/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage || `${baseUrl}/api/og/blog?title=${encodeURIComponent(post.title)}`,
    "author": {
      "@type": "Person",
      "name": post.author || "Naim Academy",
      "url": baseUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Naim Academy",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/favicon.ico`,
      },
    },
    "datePublished": publishedDate,
    "dateModified": modifiedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    "articleSection": "Education",
    "keywords": post.tags?.join(", ") || "Islamic Education, Learning",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <TranslateSelection />
      <main className="flex-1 pt-14" itemScope itemType="https://schema.org/Article">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <article itemProp="articleBody">
            {post.coverImage && (
              <div className="aspect-video rounded-lg border border-gray-300 shadow-md overflow-hidden mb-10 bg-muted">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <header className="mb-6">
              {post.titleStyle === "h2" ? (
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4" itemProp="headline">
                  {post.title}
                </h2>
              ) : post.titleStyle === "h3" ? (
                <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-4" itemProp="headline">
                  {post.title}
                </h3>
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" itemProp="headline">
                  {post.title}
                </h1>
              )}
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-3">
                  {post.authorAvatar ? (
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      className="size-10 rounded-full"
                      itemProp="image"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {post.author?.charAt(0) || "N"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground" itemProp="author" itemScope itemType="https://schema.org/Person">
                      <span itemProp="name">{post.author}</span>
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <time dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString()} itemProp="datePublished">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }) : ""}
                      </time>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {post.readingTime} min read
                      </span>
                      <span>·</span>
                      <ListenButton content={post.content} title={post.title} />
                    </div>
                  </div>
                </div>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 mt-4" itemProp="keywords">
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
              className="prose prose-lg max-w-none text-justify leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            <VoteButtons 
              slug={post.slug} 
              initialUpvotes={post.upvotes || 0} 
              initialDownvotes={post.downvotes || 0} 
            />

            <ShareButtons title={post.title} />

            <CommentsSection slug={post.slug} articleTitle={post.title} />
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
        </div>
      </main>
      <Footer />
    </>
  );
}
