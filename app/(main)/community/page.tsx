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
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy");
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
    if (!confirm("Delete this answer?")) return;

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
          <p className="text-muted-foreground">{filteredPosts.length} questions</p>
        </div>
        <Button onClick={() => setShowNewPostForm(true)} size="lg">
          <Plus className="size-4 mr-2" />
          Ask Question
        </Button>
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Ask a public question</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowNewPostForm(false)}>
                <X className="size-4" />
              </Button>
            </div>
            
            <Textarea
              placeholder="Describe your question in detail..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={5}
              className="resize-none"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {newTags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:opacity-70">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
              />
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_TAGS.filter(t => !newTags.includes(t)).slice(0, 6).map((tag, index) => {
                  const tagColors = [
                    "bg-blue-100 text-blue-700 hover:bg-blue-200",
                    "bg-green-100 text-green-700 hover:bg-green-200", 
                    "bg-purple-100 text-purple-700 hover:bg-purple-200",
                    "bg-orange-100 text-orange-700 hover:bg-orange-200",
                  ];
                  const colorClass = tagColors[index % tagColors.length];
                  return (
                    <button key={tag} onClick={() => handleAddTag(tag)} className={`px-2 py-0.5 text-xs rounded-full ${colorClass}`}>
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                Expires in 24 hours
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNewPostForm(false)}>Cancel</Button>
                <Button onClick={handleCreatePost} disabled={posting || newPost.trim().length < 10}>
                  {posting ? "Posting..." : "Post Question"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button variant={sortBy === "newest" ? "default" : "ghost"} size="sm" onClick={() => setSortBy("newest")}>Newest</Button>
          <Button variant={sortBy === "votes" ? "default" : "ghost"} size="sm" onClick={() => setSortBy("votes")}>Most Voted</Button>
          <Button variant={sortBy === "unanswered" ? "default" : "ghost"} size="sm" onClick={() => setSortBy("unanswered")}>Unanswered</Button>
        </div>

        {filterTag && (
          <Badge variant="default" className="gap-1 cursor-pointer" onClick={() => setFilterTag(null)}>
            {filterTag} <X className="size-3" />
          </Badge>
        )}
      </div>

      {/* Tags Cloud */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag, index) => {
            const tagColors = [
              "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
              "bg-green-100 text-green-700 hover:bg-green-200 border-green-200", 
              "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
              "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
              "bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200",
              "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200",
            ];
            const colorClass = tagColors[index % tagColors.length];
            return (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${colorClass} ${filterTag === tag ? "ring-2 ring-primary" : ""}`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Questions List */}
      {sortedPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg">No questions found</h3>
            <p className="text-muted-foreground">Be the first to ask!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedPosts.map((post) => {
            const isLiked = user && post.likes?.includes(user.id);
            const isOwner = user && post.authorId === user.id;
            
            return (
              <Card key={post._id} className={`hover:shadow-md transition-shadow ${post.isPinned ? "border-2 border-primary bg-primary/5" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {/* Stats Column */}
                    <div className="flex flex-col items-center gap-3 min-w-[50px]">
                      {/* Like */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`transition-colors ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                        >
                          <Heart className={`size-5 ${isLiked ? "fill-current" : ""}`} />
                        </button>
                        <span className="text-sm font-semibold">{post.likes?.length || 0}</span>
                      </div>
                      
                      <Separator className="w-full" />
                      
                      {/* Comments */}
                      <div className="flex flex-col items-center">
                        <button onClick={() => toggleComments(post._id)} className="text-muted-foreground hover:text-primary">
                          <MessageCircle className={`size-5 ${(post.comments?.length || 0) > 0 ? "text-green-600" : ""}`} />
                        </button>
                        <span className={`text-sm font-semibold ${(post.comments?.length || 0) > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                          {post.comments?.length || 0}
                        </span>
                      </div>
                      
                      <Separator className="w-full" />
                      
                      {/* Pin */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handlePin(post._id)}
                          className={`transition-colors ${post.isPinned ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                          title={post.isPinned ? "Unpin question" : "Pin question to profile"}
                        >
                          <Pin className={`size-5 ${post.isPinned ? "fill-current" : ""}`} />
                        </button>
                        <span className="text-[10px] text-muted-foreground">pin</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Pinned Badge */}
                      {post.isPinned && (
                        <Badge className="gap-1 w-fit bg-primary text-primary-foreground hover:bg-primary/90">
                          <Pin className="size-3" />
                          Pinned
                        </Badge>
                      )}
                      
                      <h3 className="text-lg font-medium leading-snug hover:text-primary cursor-pointer line-clamp-2">
                        {escapeHtml(post.content)}
                      </h3>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => {
                            const tagColors = [
                              "bg-blue-100 text-blue-700 hover:bg-blue-200",
                              "bg-green-100 text-green-700 hover:bg-green-200", 
                              "bg-purple-100 text-purple-700 hover:bg-purple-200",
                              "bg-orange-100 text-orange-700 hover:bg-orange-200",
                              "bg-pink-100 text-pink-700 hover:bg-pink-200",
                              "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
                            ];
                            const colorClass = tagColors[index % tagColors.length];
                            return (
                              <button
                                key={tag}
                                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                                className={`px-2 py-0.5 text-xs rounded-full transition-colors ${colorClass} ${filterTag === tag ? "ring-2 ring-primary" : ""}`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        {/* Left: Meta info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <button onClick={() => toggleComments(post._id)} className="hover:text-primary">
                            {post.comments?.length || 0} answers
                          </button>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {getHoursUntilExpiry(post.expiresAt)}h left
                          </span>
                        </div>

                        {/* Right: Author */}
                        <Link href={`/community/profile/${post.authorId}`} className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded-lg transition-colors">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt))}
                          </span>
                          <Avatar className="size-6">
                            {post.authorAvatar ? (
                              <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                            ) : null}
                            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                              {post.authorName?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground hover:text-primary">
                            {escapeHtml(post.authorName || "Anonymous")}
                          </span>
                        </Link>
                      </div>

                      {/* Actions - Compact */}
                      <div className="flex items-center gap-1 pt-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => handleLike(post._id)}>
                          <Heart className={`size-3 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                          <span className={isLiked ? "text-red-500" : "text-muted-foreground"}>{isLiked ? "Liked" : "Like"}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => handleShare(post.content)}>
                          <Share2 className="size-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Share</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => handleFlag(post._id)}>
                          <Flag className="size-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Flag</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => handlePin(post._id)}>
                          <Pin className={`size-3 ${post.isPinned ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                          <span className={post.isPinned ? "text-primary" : "text-muted-foreground"}>{post.isPinned ? "Pinned" : "Pin"}</span>
                        </Button>
                        {(isOwner || user?.role === "admin") && (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-destructive" onClick={() => handleDeletePost(post._id)}>
                            <Trash2 className="size-3" />
                            <span>Delete</span>
                          </Button>
                        )}
                      </div>

                      {/* Answers Section */}
                      {expandedComments.has(post._id) && (
                        <div className="pt-4 border-t space-y-4">
                          <h4 className="font-semibold text-sm">{post.comments?.length || 0} Answers</h4>
                          
                          {post.comments && post.comments.length > 0 && (
                            <div className="space-y-3">
                              {post.comments.map((comment) => (
                                <div key={comment._id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                                  <Avatar className="size-8">
                                    {comment.authorAvatar ? (
                                      <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                                    ) : null}
                                    <AvatarFallback className="text-xs bg-secondary">
                                      {comment.authorName?.charAt(0).toUpperCase() || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Link href={`/community/profile/${comment.authorId}`} className="text-sm font-medium text-primary hover:underline">
                                          {escapeHtml(comment.authorName)}
                                        </Link>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDistanceToNow(new Date(comment.createdAt))}
                                        </span>
                                      </div>
                                      {(comment.authorId === user?.id || user?.role === "admin") && (
                                        <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive hover:text-destructive" onClick={() => handleDeleteComment(post._id, comment._id)}>
                                          <Trash2 className="size-3" />
                                        </Button>
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
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}