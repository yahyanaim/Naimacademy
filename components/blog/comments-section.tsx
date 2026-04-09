"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, User, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  _id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isReplied: boolean;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}

interface CommentsSectionProps {
  slug: string;
  articleTitle: string;
}

export default function CommentsSection({ slug, articleTitle }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [slug]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/blog/comments?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim() || name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (!content.trim() || content.trim().length < 10) {
      setError("Comment must be at least 10 characters");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleSlug: slug,
          articleTitle,
          authorName: name.trim(),
          authorEmail: email.trim().toLowerCase(),
          content: content.trim(),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setContent("");
        fetchComments();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to post comment");
      }
    } catch {
      setError("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <section className="mt-12 pt-8 border-t">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="size-6 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Comments</h2>
        {comments.length > 0 && (
          <span className="px-2 py-0.5 text-sm bg-muted rounded-full">
            {comments.length}
          </span>
        )}
      </div>

      <div className="bg-card border rounded-xl p-6 mb-8">
        <h3 className="font-semibold mb-4">Leave a comment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>
          <Textarea
            placeholder="Write your comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
            required
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="size-4" />
              <span>Comment posted successfully!</span>
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              <Send className="size-4 mr-2" />
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-3" />
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="size-12 mx-auto mb-3 opacity-30" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-card border rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{comment.authorName}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">{comment.content}</p>

                  {comment.isReplied && comment.adminReply && (
                    <div className="bg-primary/5 border-l-2 border-primary pl-4 py-2 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-primary">Admin Reply</span>
                        {comment.repliedAt && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.repliedAt)}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.adminReply}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
