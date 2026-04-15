"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Pin, Heart, Clock, MessageCircle, Loader2, Send, Plus, X } from "lucide-react";
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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

function getTimeRemaining(expiresAt: string): string {
  const expires = new Date(expiresAt);
  const now = new Date();
  const diff = expires.getTime() - now.getTime();
  
  if (diff <= 0) return "Expired";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
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

  const pinnedPosts = filteredPosts.filter(p => p.isPinned);
  const regularPosts = filteredPosts.filter(p => !p.isPinned);

  const renderPost = (post: Post, isPinned = false) => (
    <div
      key={post._id}
      className={`bg-card border rounded-2xl p-5 transition-all duration-200 hover:shadow-md ${
        isPinned ? "border-primary/30 bg-primary/5" : ""
      }`}
    >
      {isPinned && (
        <div className="flex items-center gap-1.5 text-primary text-xs font-semibold mb-3 bg-primary/10 px-2.5 py-1 rounded-full w-fit">
          <Pin className="size-3" />
          Pinned
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="size-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
          {post.authorAvatar ? (
            <Image src={post.authorAvatar} alt="" width={48} height={48} className="object-cover" />
          ) : (
            <span className="text-lg font-bold text-white">{post.authorName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-base">{escapeHtml(post.authorName)}</span>
            <span className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
            <span className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <Clock className="size-3" />
              {getTimeRemaining(post.expiresAt)}
            </span>
          </div>
          
          <p className="mt-3 text-base leading-relaxed whitespace-pre-wrap">{escapeHtml(post.content)}</p>
          
          <div className="flex items-center gap-6 mt-4 pt-3 border-t">
            <button
              onClick={() => handleLike(post._id)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                post.likes.includes(user?.id || "") 
                  ? "text-red-500" 
                  : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart className={`size-5 ${post.likes.includes(user?.id || "") ? "fill-current" : ""}`} />
              {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
            </button>
            
            <button
              onClick={() => toggleComments(post._id)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="size-5" />
              {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
            </button>
            
            {user?.role === "admin" && (
              <button
                onClick={() => handlePin(post._id)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  post.isPinned ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Pin className="size-5" />
                {post.isPinned ? "Unpin" : "Pin"}
              </button>
            )}
          </div>

          {expandedComments.has(post._id) && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-primary/20">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {comment.authorAvatar ? (
                      <Image src={comment.authorAvatar} alt="" width={32} height={32} className="object-cover" />
                    ) : (
                      <span className="text-xs font-bold">{comment.authorName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 bg-muted/50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{escapeHtml(comment.authorName)}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm mt-1">{escapeHtml(comment.content)}</p>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-3 items-center">
                <Input
                  placeholder="Write a comment..."
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
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Community Home</h1>
        <p className="text-muted-foreground mt-1">Ask questions and share with the community</p>
      </div>

      {/* Create Post */}
      <div className="bg-card border rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar ? (
              <Image src={user.avatar} alt="" width={48} height={48} className="object-cover" />
            ) : (
              <span className="text-lg font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <div className="flex-1">
            {showNewPostForm ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="Ask a question to the community... (will expire in 24h)"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={4}
                  className="resize-none text-base"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-4" />
                    Expires in 24 hours
                  </span>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowNewPostForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePost} disabled={posting}>
                      {posting ? "Posting..." : "Post Question"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewPostForm(true)}
                className="w-full text-left px-4 py-3.5 rounded-xl border border-dashed hover:bg-muted/50 transition-colors text-muted-foreground"
              >
                Ask a question to the community...
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="size-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="size-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No posts yet</h3>
          <p className="text-muted-foreground mt-1">Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pinnedPosts.map((post) => renderPost(post, true))}
          {regularPosts.map((post) => renderPost(post))}
        </div>
      )}
    </div>
  );
}