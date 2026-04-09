"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, User, Mail, CheckCircle, Lock, X } from "lucide-react";
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
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"locked" | "identity" | "form">("locked");

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

  function handleStartCommenting() {
    setStep("identity");
  }

  function handleIdentitySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setStep("form");
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

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
    });
  }

  function getInitials(name: string) {
    return name.charAt(0).toUpperCase();
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

      {step === "locked" && (
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <Lock className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Join the conversation</h3>
              <p className="text-sm text-muted-foreground">
                Sign in or comment as a guest to share your thoughts
              </p>
            </div>
            <Button onClick={handleStartCommenting}>
              <MessageSquare className="size-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>
      )}

      {step === "identity" && (
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Enter your details to comment</h3>
            <button
              onClick={() => setStep("locked")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <form onSubmit={handleIdentitySubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Full name"
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
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("locked")}>
                Cancel
              </Button>
              <Button type="submit">
                Continue
              </Button>
            </div>
          </form>
        </div>
      )}

      {step === "form" && (
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">
                  {getInitials(name)}
                </span>
              </div>
              <form onSubmit={handleCommentSubmit} className="flex-1">
                <Textarea
                  placeholder={`What do you think, ${name.split(" ")[0]}?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="resize-none mb-3 border rounded-lg"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep("identity")}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Comment as {name}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {error && (
                      <span className="text-xs text-red-500">{error}</span>
                    )}
                    {success && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="size-3" />
                        Posted!
                      </span>
                    )}
                    <Button type="submit" size="sm" disabled={submitting}>
                      <Send className="size-4 mr-1" />
                      {submitting ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setStep("locked")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close comment box
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 mt-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="size-10 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-1" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 && (
        <div className="space-y-6 mt-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">
                  {getInitials(comment.authorName)}
                </span>
              </div>
              <div className="flex-1">
                <div className="bg-muted/50 rounded-2xl px-4 py-2">
                  <p className="font-semibold text-sm mb-1">{comment.authorName}</p>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 px-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                {comment.isReplied && comment.adminReply && (
                  <div className="flex gap-2 mt-3 ml-4">
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">A</span>
                    </div>
                    <div className="bg-primary/10 rounded-2xl px-4 py-2 flex-1">
                      <p className="font-semibold text-sm mb-1">Admin</p>
                      <p className="text-sm text-muted-foreground">{comment.adminReply}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
