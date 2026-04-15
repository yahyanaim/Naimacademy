"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Pin, 
  Heart, 
  Clock, 
  MessageCircle, 
  Loader2, 
  Send, 
  Plus, 
  X, 
  ThumbsUp,
  Bookmark,
  Share2,
  Flag,
  Check
} from "lucide-react";
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
  tags: string[];
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

const SUGGESTED_TAGS = [
  "javascript", "python", "react", "nodejs", "css", "html",
  "api", "database", "mongodb", "nextjs", "typescript", "git"
];

export default function CommunityHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "unanswered">("newest");
  const [filterTag, setFilterTag] = useState<string | null>(null);

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

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !newTags.includes(normalizedTag) && newTags.length < 5) {
      setNewTags([...newTags, normalizedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewTags(newTags.filter(t => t !== tag));
  };

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
          tags: newTags,
          authorName: user?.name,
          authorEmail: user?.email,
          authorAvatar: user?.avatar,
        }),
      });

      if (res.ok) {
        toast.success("Question posted!");
        setNewPost("");
        setNewTags([]);
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
        setPosts(posts.map(p => {
          if (p._id === postId) {
            return {
              ...p,
              likes: data.liked 
                ? [...p.likes, data.userId] 
                : p.likes.filter(id => id !== data.userId)
            };
          }
          return p;
        }));
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
        fetchPosts();
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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || post.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

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

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).slice(0, 10);

  const renderPost = (post: Post) => {
    const isLiked = post.likes.includes(user?.id || "");
    
    return (
      <div key={post._id} className="bg-card border rounded-lg overflow-hidden">
        <div className="flex">
          {/* Stats Column - StackOverflow Style */}
          <div className="w-16 bg-muted/30 flex flex-col items-center py-4 gap-3 border-r">
            {/* Votes */}
            <div className="text-center">
              <div className={`flex flex-col items-center p-1 rounded ${
                post.likes.length > 0 ? "text-red-500" : "text-muted-foreground"
              }`}>
                <Heart 
                  className={`size-6 cursor-pointer transition-colors ${
                    isLiked ? "fill-red-500 text-red-500" : "hover:text-red-500"
                  }`}
                  onClick={() => handleLike(post._id)} 
                />
                <span className="text-sm font-bold">{post.likes.length}</span>
              </div>
            </div>

            {/* Answers */}
            <div className={`text-center p-1 rounded ${post.comments.length > 0 ? "bg-green-100 text-green-700" : ""}`}>
              <div className={`flex flex-col items-center ${post.comments.length > 0 ? "" : "text-muted-foreground"}`}>
                <MessageCircle className="size-5" />
                <span className="text-sm font-bold">{post.comments.length}</span>
                <span className="text-[10px]">answers</span>
              </div>
            </div>

            {/* Views */}
            <div className="text-center text-muted-foreground">
              <span className="text-xs">{getHoursUntilExpiry(post.expiresAt)}h left</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-primary hover:text-primary/80 cursor-pointer line-clamp-2">
                  {escapeHtml(post.content)}
                </h3>
              </div>
              
              {/* Action Buttons */}
              {user?.role === "admin" && (
                <button
                  onClick={() => handlePin(post._id)}
                  className={`p-2 rounded-lg transition-colors ${
                    post.isPinned 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                  title={post.isPinned ? "Unpin post" : "Pin post"}
                >
                  <Pin className={`size-4 ${post.isPinned ? "fill-current" : ""}`} />
                </button>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    filterTag === tag
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <button className="hover:text-primary flex items-center gap-1">
                  <Share2 className="size-3" />
                  Share
                </button>
                <button className="hover:text-primary flex items-center gap-1">
                  <Flag className="size-3" />
                  Flag
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  asked {formatDistanceToNow(new Date(post.createdAt))}
                </span>
              </div>
            </div>

            {/* Comments Section */}
            {expandedComments.has(post._id) && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {post.comments.length > 0 && (
                  <div className="space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-3 border-b pb-3">
                        <div className="flex flex-col items-center gap-1">
                          <Heart className="size-4 text-muted-foreground hover:text-red-500 cursor-pointer" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/community/profile/${comment.authorId}`}
                              className="font-medium text-sm text-primary hover:underline"
                            >
                              {escapeHtml(comment.authorName)}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              answered {formatDistanceToNow(new Date(comment.createdAt))}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{escapeHtml(comment.content)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Add your answer..."
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
          <div className="w-44 bg-muted/20 p-3 border-l flex flex-col justify-start">
            <div className="text-[11px] text-muted-foreground mb-2">
              asked {formatDistanceToNow(new Date(post.createdAt))}
            </div>
            <Link 
              href={`/community/profile/${post.authorId}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden flex-shrink-0">
                {post.authorAvatar ? (
                  <Image src={post.authorAvatar} alt="" width={32} height={32} className="object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white">{post.authorName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-primary truncate hover:underline">
                  {escapeHtml(post.authorName)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {post.likes.length} votes
                </p>
              </div>
            </Link>
            
            <button
              onClick={() => toggleComments(post._id)}
              className="mt-auto text-xs text-primary hover:underline pt-2"
            >
              {expandedComments.has(post._id) ? "Hide answers" : `${post.comments.length} answers`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Questions</h1>
          <p className="text-muted-foreground mt-1">{filteredPosts.length} questions</p>
        </div>
        <Button onClick={() => setShowNewPostForm(true)} className="gap-2">
          <Plus className="size-4" />
          Ask Question
        </Button>
      </div>

      {/* New Post Form - StackOverflow Style */}
      {showNewPostForm && (
        <div className="bg-card border rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Ask a public question</h2>
            <button 
              onClick={() => setShowNewPostForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                placeholder="What's your programming question? Be specific."
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Imagine you're asking a question to a colleague
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Body</label>
              <Textarea
                placeholder="Include all the information someone would need to answer your question..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={8}
                className="resize-none w-full font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newTags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-sm rounded-md"
                  >
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Add up to 5 tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                className="w-full"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-muted-foreground mr-2">Suggested:</span>
                {SUGGESTED_TAGS.filter(t => !newTags.includes(t)).slice(0, 6).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="text-xs px-2 py-0.5 bg-muted rounded hover:bg-muted/80 text-muted-foreground"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>Questions expire after 24 hours</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowNewPostForm(false)}>
                  Discard
                </Button>
                <Button onClick={handleCreatePost} disabled={posting || newPost.trim().length < 10}>
                  {posting ? "Posting..." : "Post Question"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b">
        <Input
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
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

        {filterTag && (
          <button
            onClick={() => setFilterTag(null)}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20"
          >
            Tag: {filterTag}
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Tags Cloud */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                filterTag === tag
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-lg animate-pulse">
              <div className="flex">
                <div className="w-16 bg-muted/30 p-4" />
                <div className="flex-1 p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-muted rounded w-16" />
                    <div className="h-5 bg-muted rounded w-20" />
                  </div>
                </div>
                <div className="w-44 bg-muted/30 p-4" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <div className="size-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No questions found</h3>
          <p className="text-muted-foreground mt-1">
            {filterTag ? `No questions with tag "${filterTag}"` : "Be the first to ask a question!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => renderPost(post))}
        </div>
      )}
    </div>
  );
}