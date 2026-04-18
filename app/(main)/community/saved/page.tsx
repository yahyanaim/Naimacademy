"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Pin, 
  Heart, 
  Clock, 
  MessageCircle, 
  Loader2, 
  Send,
  X,
  Share2,
  Flag,
  Trash2,
  Bookmark,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

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
  saved: string[];
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

export default function SavedQuestionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/community?type=saved");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      toast.error("Failed to load saved posts");
    }
  };

  useEffect(() => {
    const init = async () => {
      const [userRes, postsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/community?type=saved")
      ]);
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "like", postId }),
      });

      if (res.ok) {
        fetchPosts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to like");
      }
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "save", postId }),
      });

      if (res.ok) {
        toast.success("Question removed from saved");
        fetchPosts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to unsave");
      }
    } catch {
      toast.error("Failed to unsave");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/community" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Saved Questions</h1>
            <p className="text-sm text-muted-foreground">{posts.length} saved</p>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bookmark className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg">No saved questions</h3>
            <p className="text-muted-foreground mt-1">Bookmark questions to find them here</p>
            <Link href="/community">
              <Button className="mt-4">Browse Questions</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = user && post.likes?.includes(user.id);
            const isSaved = user && post.saved?.includes(user.id);
            const isOwner = user && post.authorId === user.id;
            
            return (
              <Card key={post._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Stats Column */}
                    <div className="flex flex-col items-center gap-2 min-w-[40px]">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex flex-col items-center gap-0.5 ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                      >
                        <Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} />
                        <span className="text-xs font-semibold">{post.likes?.length || 0}</span>
                      </button>
                      <span className="text-[10px] text-muted-foreground">likes</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Pinned & Expired Badges */}
                      {post.isPinned && (
                        <Badge className="gap-1 w-fit bg-black text-white hover:bg-black/80">
                          <Pin className="size-3" />
                          Pinned
                        </Badge>
                      )}
                      {post.expiresAt && new Date(post.expiresAt) < new Date() && (
                        <Badge variant="outline" className="gap-1 w-fit text-red-500 border-red-300">
                          <Clock className="size-3" />
                          Expired
                        </Badge>
                      )}
                      
                      <h3 className="text-sm font-medium leading-snug">
                        {escapeHtml(post.content)}
                      </h3>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
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
                              <span key={tag} className={`px-2 py-0.5 text-xs rounded-full ${colorClass}`}>
                                #{tag}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        {/* Actions */}
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <button onClick={() => handleLike(post._id)} className={`flex items-center gap-1 hover:text-red-500 ${isLiked ? "text-red-500" : ""}`}>
                            <Heart className={`size-3 ${isLiked ? "fill-current" : ""}`} />
                            <span>{post.likes?.length || 0}</span>
                          </button>
                          <button onClick={() => {
                            navigator.clipboard.writeText(post.content);
                            toast.success("Link copied!");
                          }} className="flex items-center gap-1 hover:text-blue-500">
                            <Share2 className="size-3" />
                            <span>Share</span>
                          </button>
                          <button onClick={() => handleSave(post._id)} className="flex items-center gap-1 text-yellow-500 hover:text-yellow-600">
                            <Bookmark className={`size-3 ${isSaved ? "fill-current" : ""}`} />
                            <span>Saved</span>
                          </button>
                          {(isOwner || user?.role === "admin") && (
                            <button onClick={async () => {
                              if (confirm("Delete this question?")) {
                                const res = await fetch("/api/community", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ type: "delete", postId: post._id }),
                                });
                                if (res.ok) {
                                  toast.success("Question deleted");
                                  fetchPosts();
                                }
                              }
                            }} className="flex items-center gap-1 text-red-500 hover:text-red-600">
                              <Trash2 className="size-3" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>

                        {/* Author */}
                        <Link href={`/community/profile/${post.authorId}`} className="flex items-center gap-1.5 hover:bg-muted/50 px-1.5 py-0.5 rounded transition-colors">
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt))}
                          </span>
                          <Avatar className="size-5">
                            {post.authorAvatar ? (
                              <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                            ) : null}
                            <AvatarFallback className="text-[8px] bg-muted text-muted-foreground">
                              {post.authorName?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground hover:text-primary">
                            {escapeHtml(post.authorName || "Anonymous")}
                          </span>
                        </Link>
                      </div>

                      {/* Answers - Always Visible */}
                      <div className="pt-3 space-y-2">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment) => (
                            <div key={comment._id} className="flex gap-2 text-xs">
                              <Avatar className="size-5">
                                {comment.authorAvatar ? (
                                  <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                                ) : null}
                                <AvatarFallback className="text-[8px]">
                                  {comment.authorName?.charAt(0).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <span className="font-medium">{comment.authorName}: </span>
                                <span>{escapeHtml(comment.content)}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No answers yet</p>
                        )}
                      </div>

                      {/* Answer Input */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Write an answer..."
                          value={newComment[post._id] || ""}
                          onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post._id);
                            }
                          }}
                          className="flex-1 h-8 px-3 text-xs border rounded-full focus:outline-none focus:ring-1"
                        />
                        <Button size="sm" className="h-8 px-3" onClick={() => handleAddComment(post._id)}>
                          <Send className="size-3" />
                        </Button>
                      </div>
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
