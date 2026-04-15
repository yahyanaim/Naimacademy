"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pin, Heart, Clock, MessageCircle, Loader2, Send, Plus, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Post {
  _id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  isPinned: boolean;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  expiresAt: string;
}

interface Comment {
  _id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
}

function getHoursUntilExpiry(expiresAt: string): number {
  const expires = new Date(expiresAt);
  const now = new Date();
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60)));
}

export default function CommunityHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "unanswered">("newest");

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/community?type=posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const handleCreatePost = async () => {
    if (!newPost.trim() || newPost.trim().length < 10) {
      toast.error("Post must be at least 10 characters");
      return;
    }

    setPosting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "post",
          content: newPost,
          authorName: user?.name,
          authorEmail: user?.email,
          authorAvatar: user?.avatar,
        }),
      });

      if (res.ok) {
        toast.success("Question posted!");
        setNewPost("");
        setShowNewPostForm(false);
        fetchPosts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to post");
      }
    } catch {
      toast.error("Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "like", postId }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(p => 
          p._id === postId 
            ? { ...p, likes: data.liked ? [...p.likes, user?.id || ""] : p.likes.filter(id => id !== user?.id) }
            : p
        ));
      }
    } catch {
      toast.error("Failed to like");
    }
  };

  const handlePin = async (postId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pin", postId }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(p => 
          p._id === postId ? { ...p, isPinned: data.isPinned } : p
        ));
        toast.success(data.isPinned ? "Post pinned" : "Post unpinned");
      }
    } catch {
      toast.error("Failed to pin");
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comment",
          postId,
          content,
          authorName: user?.name,
          authorEmail: user?.email,
          authorAvatar: user?.avatar,
        }),
      });

      if (res.ok) {
        setNewComment({ ...newComment, [postId]: "" });
        fetchPosts();
      }
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    if (sortBy === "votes") {
      return b.likes.length - a.likes.length;
    } else if (sortBy === "unanswered") {
      return a.comments.length - b.comments.length;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pinnedPosts = sortedPosts.filter(p => p.isPinned);
  const regularPosts = sortedPosts.filter(p => !p.isPinned);

  const renderPost = (post: Post, showAuthor = true) => (
    <div key={post._id} className="bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Vote Column - StackOverflow Style */}
        <div className="w-16 bg-muted/30 flex flex-col items-center py-4 gap-1 border-r">
          <button 
            onClick={() => handleLike(post._id)}
            className="flex flex-col items-center p-1 hover:bg-muted rounded transition-colors"
          >
            <ThumbsUp className={`size-5 ${post.likes.includes(user?.id || "") ? "text-primary fill-primary" : "text-muted-foreground"}`} />
            <span className="text-sm font-bold text-foreground">{post.likes.length}</span>
          </button>
          
          <button
            onClick={() => toggleComments(post._id)}
            className="flex flex-col items-center p-1 hover:bg-muted rounded transition-colors mt-2"
          >
            <MessageCircle className={`size-5 ${post.comments.length > 0 ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-sm font-bold text-foreground">{post.comments.length}</span>
          </button>

          {user?.role === "admin" && (
            <button
              onClick={() => handlePin(post._id)}
              className="flex flex-col items-center p-1 hover:bg-muted rounded transition-colors mt-2"
            >
              <Pin className={`size-5 ${post.isPinned ? "text-primary fill-primary" : "text-muted-foreground"}`} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {post.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded mb-2">
              <Pin className="size-3" />
              Pinned
            </span>
          )}
          
          <p className="text-base leading-relaxed whitespace-pre-wrap">{escapeHtml(post.content)}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              <Clock className="size-3" />
              asked {formatDistanceToNow(new Date(post.createdAt))}
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
              Expires in {getHoursUntilExpiry(post.expiresAt)}h
            </span>
          </div>

          {/* Comments Section */}
          {expandedComments.has(post._id) && (
            <div className="mt-4 pt-4 border-t space-y-3">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 bg-muted/50 p-3 rounded-lg">
                  <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {comment.authorAvatar ? (
                      <Image src={comment.authorAvatar} alt="" width={32} height={32} className="object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-white">{comment.authorName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/community/profile/${comment.authorId}`}
                        className="font-medium text-sm hover:text-primary"
                      >
                        {escapeHtml(comment.authorName)}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt))}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{escapeHtml(comment.content)}</p>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Add an answer..."
                  value={newComment[post._id] || ""}
                  onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment(post._id)}
                  className="flex-1"
                />
                <Button size="sm" onClick={() => handleAddComment(post._id)}>
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Author Card - StackOverflow Style */}
        {showAuthor && (
          <div className="w-40 bg-muted/30 p-3 border-l">
            <div className="text-xs text-muted-foreground mb-2">
              asked {formatDistanceToNow(new Date(post.createdAt))}
            </div>
            <Link 
              href={`/community/profile/${post.authorId}`}
              className="flex items-center gap-2 hover:bg-muted p-1.5 rounded-lg transition-colors"
            >
              <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden flex-shrink-0">
                {post.authorAvatar ? (
                  <Image src={post.authorAvatar} alt="" width={32} height={32} className="object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white">{post.authorName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate hover:text-primary">{escapeHtml(post.authorName)}</p>
                <p className="text-xs text-muted-foreground">{post.likes.length} votes</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Questions</h1>
          <p className="text-muted-foreground mt-1">{filteredPosts.length} questions</p>
        </div>
        <Button onClick={() => setShowNewPostForm(true)}>
          <Plus className="size-4 mr-2" />
          Ask Question
        </Button>
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <div className="bg-card border rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-4">Ask a Question</h3>
          <Textarea
            placeholder="What's your question? Be specific and include details..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={6}
            className="resize-none text-base mb-4"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-4" />
              This question will expire in 24 hours
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowNewPostForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost} disabled={posting || newPost.trim().length < 10}>
                {posting ? "Posting..." : "Post Question"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          <button
            onClick={() => setSortBy("newest")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sortBy === "newest" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy("votes")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sortBy === "votes" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Most Voted
          </button>
          <button
            onClick={() => setSortBy("unanswered")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sortBy === "unanswered" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unanswered
          </button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-lg animate-pulse">
              <div className="flex">
                <div className="w-16 bg-muted/30 p-4" />
                <div className="flex-1 p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <div className="size-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No questions yet</h3>
          <p className="text-muted-foreground mt-1">Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pinnedPosts.map((post) => renderPost(post, true))}
          {regularPosts.map((post) => renderPost(post, true))}
        </div>
      )}
    </div>
  );
}