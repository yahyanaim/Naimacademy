"use client";

import { useState, useEffect } from "react";
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
  Share2,
  Flag,
  Trash2,
  Bookmark
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

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
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

  const fetchPosts = async () => {
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
  };

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }
      } catch (err) {
        console.error("Error initializing:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
    fetchPosts();
  }, []);

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

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(`/api/community/post/${postId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Question deleted");
        fetchPosts();
      }
    } catch {
      toast.error("Failed to delete question");
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
        fetchPosts();
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
        toast.success(data.isPinned ? "Question pinned" : "Question unpinned");
        fetchPosts();
      }
    } catch {
      toast.error("Failed to pin");
    }
  };

  const handleFlag = async (postId: string) => {
    toast.info("Post flagged for review");
  };

  const handleShare = async (postContent: string) => {
    try {
      await navigator.clipboard.writeText(postContent.substring(0, 100) + "...");
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
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
      toast.error("Failed to add answer");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm("Are you sure you want to delete this answer?")) return;

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "deleteComment", postId, commentId }),
      });

      if (res.ok) {
        toast.success("Answer deleted");
        fetchPosts();
      }
    } catch {
      toast.error("Failed to delete answer");
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
    const matchesTag = !filterTag || (post.tags && post.tags.includes(filterTag));
    return matchesSearch && matchesTag;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    if (sortBy === "votes") {
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    } else if (sortBy === "unanswered") {
      return (a.comments?.length || 0) - (b.comments?.length || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 15);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Questions</h1>
          <p className="text-muted-foreground mt-1">{filteredPosts.length} questions</p>
        </div>
        <Button onClick={() => setShowNewPostForm(true)} className="gap-2">
          <Plus className="size-4" />
          Ask Question
        </Button>
      </div>

      {/* New Post Form */}
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
              <label className="block text-sm font-medium mb-2">Body</label>
              <Textarea
                placeholder="What's your programming question? Include all details..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={6}
                className="resize-none w-full"
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
                placeholder="Add tags (press Enter)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
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
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="size-4" />
                Expires in 24 hours
              </span>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowNewPostForm(false)}>Discard</Button>
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
          <button onClick={() => setSortBy("newest")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sortBy === "newest" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Newest</button>
          <button onClick={() => setSortBy("votes")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sortBy === "votes" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Most Voted</button>
          <button onClick={() => setSortBy("unanswered")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sortBy === "unanswered" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Unanswered</button>
        </div>

        {filterTag && (
          <button onClick={() => setFilterTag(null)} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
            Tag: {filterTag} <X className="size-3" />
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
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${filterTag === tag ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Questions List */}
      {sortedPosts.length === 0 ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <MessageCircle className="size-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <h3 className="font-semibold text-lg">No questions found</h3>
          <p className="text-muted-foreground mt-1">Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPosts.map((post) => {
            const isLiked = user && post.likes?.includes(user.id);
            const isOwner = user && post.authorId === user.id;
            const hoursLeft = getHoursUntilExpiry(post.expiresAt);
            
            return (
              <div key={post._id} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Pinned Badge */}
                {post.isPinned && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-2">
                    <Pin className="size-3" />
                    Pinned
                  </div>
                )}
                
                <div className="flex gap-4">
                  {/* Stats - Left Side */}
                  <div className="flex flex-col items-center gap-3 min-w-[60px] text-center">
                    <div className={`flex flex-col items-center ${isLiked ? "text-red-500" : "text-muted-foreground"}`}>
                      <Heart 
                        className={`size-5 cursor-pointer transition-colors ${isLiked ? "fill-red-500" : "hover:text-red-500"}`}
                        onClick={() => handleLike(post._id)}
                      />
                      <span className="text-sm font-semibold">{post.likes?.length || 0}</span>
                    </div>
                    
                    <div className={`flex flex-col items-center ${(post.comments?.length || 0) > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                      <MessageCircle className="size-5" />
                      <span className="text-sm font-semibold">{post.comments?.length || 0}</span>
                    </div>

                    <div className="flex flex-col items-center text-muted-foreground">
                      <Clock className="size-4" />
                      <span className="text-xs">{hoursLeft}h</span>
                    </div>
                  </div>

                  {/* Content - Middle */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-foreground hover:text-primary cursor-pointer line-clamp-2 mb-2">
                      {escapeHtml(post.content)}
                    </h3>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                            className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                              filterTag === tag ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <button onClick={() => handleShare(post.content)} className="hover:text-primary flex items-center gap-1">
                          <Share2 className="size-3" /> Share
                        </button>
                        <button onClick={() => handleFlag(post._id)} className="hover:text-primary flex items-center gap-1">
                          <Flag className="size-3" /> Flag
                        </button>
                        <button onClick={() => toggleComments(post._id)} className="hover:text-primary">
                          {expandedComments.has(post._id) ? "Hide answers" : "Add answer"}
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Author */}
                        <Link href={`/community/profile/${post.authorId}`} className="flex items-center gap-2 text-xs hover:bg-muted/50 p-1 rounded transition-colors">
                          <div className="size-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden">
                            {post.authorAvatar ? (
                              <Image src={post.authorAvatar} alt="" width={24} height={24} className="object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-white">{post.authorName?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="text-primary">{escapeHtml(post.authorName || "Anonymous")}</span>
                        </Link>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt))}</span>
                      </div>
                    </div>

                    {/* Answers Section */}
                    {expandedComments.has(post._id) && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-3">{post.comments?.length || 0} Answers</h4>
                        
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {post.comments.map((comment) => (
                              <div key={comment._id} className="flex gap-3 pb-3 border-b last:border-0">
                                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                  <Heart className="size-4 hover:text-red-500 cursor-pointer" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <Link href={`/community/profile/${comment.authorId}`} className="text-xs font-medium text-primary hover:underline">
                                        {escapeHtml(comment.authorName)}
                                      </Link>
                                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt))}</span>
                                    </div>
                                    {(comment.authorId === user?.id || user?.role === "admin") && (
                                      <button onClick={() => handleDeleteComment(post._id, comment._id)} className="text-muted-foreground hover:text-red-500">
                                        <Trash2 className="size-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm">{escapeHtml(comment.content)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Input
                            placeholder="Write your answer..."
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

                  {/* Actions - Right Side */}
                  <div className="flex flex-col gap-1">
                    {(isOwner || user?.role === "admin") && (
                      <button onClick={() => handleDeletePost(post._id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                    {user?.role === "admin" && (
                      <button onClick={() => handlePin(post._id)} className={`p-2 rounded transition-colors ${post.isPinned ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted"}`} title={post.isPinned ? "Unpin" : "Pin"}>
                        <Pin className={`size-4 ${post.isPinned ? "fill-current" : ""}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}