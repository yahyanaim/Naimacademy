"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Search, Eye, Reply, CheckCircle, Clock, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Comment {
  _id: string;
  articleSlug: string;
  articleTitle: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isReplied: boolean;
  adminReply?: string;
  createdAt: string;
  upvotes?: number;
  downvotes?: number;
  userVote?: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      const res = await fetch(`/api/admin/comments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setPagination(data.pagination);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(comment: Comment) {
    if (!confirm(`Delete comment from "${comment.authorName}"?\n\n"${comment.content.substring(0, 50)}..."`)) return;
    try {
      const res = await fetch(`/api/admin/comments/${comment._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Comment deleted");
        fetchComments();
      } else {
        toast.error("Failed to delete comment");
      }
    } catch {
      toast.error("Failed to delete comment");
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  const filteredComments = search
    ? comments.filter(
        (c) =>
          c.authorName.toLowerCase().includes(search.toLowerCase()) ||
          c.authorEmail.toLowerCase().includes(search.toLowerCase()) ||
          c.articleTitle.toLowerCase().includes(search.toLowerCase()) ||
          c.content.toLowerCase().includes(search.toLowerCase())
      )
    : comments;

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comments</h1>
          <p className="text-sm text-muted-foreground">
            Manage article comments and replies
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, article..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Article</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Comment</th>
                <th className="px-4 py-3 text-left text-sm font-medium">User Vote</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-muted rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-muted rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-48 bg-muted rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-muted rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-muted rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-muted rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-8 w-20 bg-muted rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <MessageCircle className="size-12 mx-auto mb-3 opacity-30" />
                    <p>No comments found</p>
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => (
                  <tr key={comment._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">{comment.authorEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/blog/${comment.articleSlug}`}
                        target="_blank"
                        className="text-sm text-primary hover:underline line-clamp-1 max-w-[200px]"
                      >
                        {comment.articleTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-[250px]">
                        {comment.content}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {comment.userVote === "up" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          <ThumbsUp className="size-3" />
                          Upvoted
                        </span>
                      ) : comment.userVote === "down" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          <ThumbsDown className="size-3" />
                          Downvoted
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No vote</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(comment.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/blog/${comment.articleSlug}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="size-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/comments/${comment._id}`}>
                          <Button variant="ghost" size="sm">
                            <Reply className="size-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(comment)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchComments(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="size-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchComments(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
