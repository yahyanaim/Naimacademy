"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageCircle, Search, Eye, Reply, CheckCircle, Clock, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Trash2, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "pending" | "replied">("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const fetchComments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20", filter });
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
  }, [filter]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.comments);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchComments(currentPage);
    fetchStats();
  }, [currentPage, fetchComments]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchComments(currentPage);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, currentPage, fetchComments]);

  async function handleDelete(comment: Comment) {
    if (!confirm(`Delete comment from "${comment.authorName}"?\n\n"${comment.content.substring(0, 50)}..."`)) return;
    try {
      const res = await fetch(`/api/admin/comments/${comment._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Comment deleted");
        fetchComments(currentPage);
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
      <div>
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-sm text-muted-foreground">
          Manage article comments and replies
        </p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Comments</CardTitle>
                <MessageCircle className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stats.growth > 0 ? (
                    <TrendingUp className="size-4 text-green-500" />
                  ) : stats.growth < 0 ? (
                    <TrendingDown className="size-4 text-red-500" />
                  ) : null}
                  <span className={`text-xs ${stats.growth > 0 ? "text-green-500" : stats.growth < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {stats.growth > 0 ? "+" : ""}{stats.growth}% this week
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-2 italic">
                  {stats.commentsLastWeek} new comment{stats.commentsLastWeek !== 1 ? "s" : ""} this week
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Replies</CardTitle>
                <Clock className="size-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
                <p className="text-xs text-muted-foreground/70 mt-2 italic">
                  {stats.pending > 0 ? "Respond to build engagement" : "All comments replied!"}
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Replied Comments</CardTitle>
                <CheckCircle className="size-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
                <p className="text-xs text-green-500 mt-1">
                  {Math.round((stats.replied / stats.total || 0) * 100)}% response rate
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2 italic">
                  {stats.replied > 0 ? "Great engagement!" : "Start replying"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">Comments Engagement Overview</h3>
            <p className="text-sm text-muted-foreground">
              Your articles have received <span className="font-medium text-foreground">{stats.total}</span> total comments.{" "}
              {stats.pending > 0 ? (
                <>
                  <span className="font-medium text-amber-600">{stats.pending}</span> comment{stats.pending > 1 ? "s are" : " is"} waiting for a reply.{" "}
                  Responding promptly builds trust and encourages more participation.
                </>
              ) : (
                <>
                  <span className="font-medium text-green-600">All comments have been replied to!</span>{" "}
                  This shows excellent engagement with your student community.
                </>
              )}{" "}
              Your current response rate is{" "}
              <span className="font-medium text-foreground">{Math.round((stats.replied / stats.total || 0) * 100)}%</span>.
              {stats.growth > 0 ? (
                <>
                  {" "}Comment activity is growing with <span className="font-medium text-foreground">{stats.commentsLastWeek}</span> new comment{stats.commentsLastWeek !== 1 ? "s" : ""} this week.
                </>
              ) : stats.growth < 0 ? (
                <>
                  {" "}Comment activity has decreased compared to last week. Consider promoting discussion in your articles.
                </>
              ) : null}
            </p>
          </div>
        </>
      )}

      <div className="flex gap-2 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
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
        <Select value={filter} onValueChange={(v) => { if (v) { setFilter(v as "all" | "pending" | "replied"); setCurrentPage(1); } }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Comments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              Page {currentPage} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="size-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                disabled={currentPage >= pagination.pages}
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
