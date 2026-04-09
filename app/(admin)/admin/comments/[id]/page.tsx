"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, Clock, User, Mail, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  _id: string;
  articleSlug: string;
  articleTitle: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isReplied: boolean;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function CommentReplyPage() {
  const params = useParams();
  const router = useRouter();
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComment();
  }, [params.id]);

  async function fetchComment() {
    try {
      const res = await fetch(`/api/admin/comments/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setComment(data.comment);
        if (data.comment?.adminReply) {
          setReply(data.comment.adminReply);
        }
      } else {
        router.push("/admin/comments");
      }
    } catch {
      router.push("/admin/comments");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!reply.trim() || reply.trim().length < 2) {
      setError("Reply must be at least 2 characters");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/comments/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: reply.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setComment(data.comment);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit reply");
      }
    } catch {
      setError("Failed to submit reply");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="border rounded-xl p-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!comment) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="size-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-muted-foreground">Comment not found</p>
        <Link href="/admin/comments">
          <Button variant="link" className="mt-2">
            Back to Comments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/comments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-2" />
            Back to Comments
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="border rounded-xl p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Comment Details</h2>
              {comment.isReplied ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  <CheckCircle className="size-3" />
                  Replied
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                  <Clock className="size-3" />
                  Pending
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{comment.authorName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3" />
                    {comment.authorEmail}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Article</p>
                <Link
                  href={`/blog/${comment.articleSlug}`}
                  target="_blank"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {comment.articleTitle}
                  <ExternalLink className="size-3" />
                </Link>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Posted on</p>
                <p className="text-sm">{formatDate(comment.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Comment</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{comment.content}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-xl p-6 bg-card">
            <h2 className="text-lg font-semibold mb-4">Admin Reply</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  placeholder="Write your reply to this comment..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This reply will be visible publicly under the comment.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {success && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="size-4" />
                  <span>Reply submitted successfully!</span>
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  <Send className="size-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit Reply"}
                </Button>
              </div>
            </form>

            {comment.isReplied && comment.adminReply && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Current Reply</p>
                <div className="bg-primary/5 border-l-2 border-primary p-3 rounded-r-lg">
                  <p className="text-sm whitespace-pre-wrap">{comment.adminReply}</p>
                  {comment.repliedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Replied on {formatDate(comment.repliedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
