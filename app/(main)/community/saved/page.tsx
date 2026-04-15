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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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

function getHoursUntilExpiry(expiresAt: string): number {
  const expires = new Date(expiresAt);
  const now = new Date();
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60)));
}

export default function SavedQuestionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
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
        toast.success("Question unsaved");
        fetchPosts();
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

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/community">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bookmark className="size-5 sm:size-6 text-yellow-500" />
            Saved Questions
          </h1>
          <p className="text-muted-foreground text-sm">{posts.length} saved questions</p>
        </div>
      </div>

      {/* Questions List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg">No saved questions</h3>
            <p className="text-muted-foreground">Bookmark questions to find them here</p>
            <Link href="/community">
              <Button className="mt-4">Browse Questions</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const isLiked = user && post.likes?.includes(user.id);
            const isSaved = user && post.saved?.includes(user.id);
            
            return (
              <Card key={post._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Stats Column */}
                    <div className="flex flex-col items-center gap-2 min-w-[40px]">
                      {/* Like */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`transition-colors ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                        >
                          <Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} />
                        </button>
                        <span className="text-xs font-semibold">{post.likes?.length || 0}</span>
                      </div>
                      
                      <Separator className="w-full" />
                      
                      {/* Comments */}
                      <div className="flex flex-col items-center">
                        <button onClick={() => toggleComments(post._id)} className="text-muted-foreground hover:text-primary">
                          <MessageCircle className={`size-4 ${(post.comments?.length || 0) > 0 ? "text-green-600" : ""}`} />
                        </button>
                        <span className={`text-xs font-semibold ${(post.comments?.length || 0) > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                          {post.comments?.length || 0}
                        </span>
                      </div>
                      
                      <Separator className="w-full" />
                      
                      {/* Pin */}
                      <div className="flex flex-col items-center">
                        <Pin className={`size-4 ${post.isPinned ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-[9px] text-muted-foreground">pin</span>
                      </div>
                      
                      <Separator className="w-full" />
                      
                      {/* Save */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleSave(post._id)}
                          className={`transition-colors ${isSaved ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
                          title="Unsave question"
                        >
                          <Bookmark className={`size-4 ${isSaved ? "fill-current" : ""}`} />
                        </button>
                        <span className="text-[9px] text-muted-foreground">save</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Pinned Badge */}
                      {post.isPinned && (
                        <Badge variant="outline" className="gap-1 w-fit text-black border-black/50">
                          <Pin className="size-3" />
                          Pinned
                        </Badge>
                      )}
                      
                      <h3 className="text-sm font-medium leading-snug hover:text-primary cursor-pointer line-clamp-2">
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
                              <span key={tag} className={`px-1.5 py-0.5 text-[10px] rounded-full ${colorClass}`}>
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <button onClick={() => toggleComments(post._id)} className="hover:text-primary">
                            {post.comments?.length || 0} answers
                          </button>
                          <span className="flex items-center gap-0.5">
                            <Clock className="size-2.5" />
                            {getHoursUntilExpiry(post.expiresAt)}h left
                          </span>
                        </div>

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

                      {/* Actions - Compact */}
                      <div className="flex items-center gap-0.5 pt-1">
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] gap-0.5" onClick={() => handleLike(post._id)}>
                          <Heart className={`size-2.5 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                          <span className={isLiked ? "text-red-500" : "text-muted-foreground"}>{isLiked ? "Liked" : "Like"}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] gap-0.5" onClick={() => handleSave(post._id)}>
                          <Bookmark className={`size-2.5 ${isSaved ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                          <span className={isSaved ? "text-yellow-500" : "text-muted-foreground"}>Saved</span>
                        </Button>
                      </div>

                      {/* Answers Section */}
                      {expandedComments.has(post._id) && (
                        <div className="pt-3 border-t space-y-3">
                          <h4 className="font-semibold text-xs">{post.comments?.length || 0} Answers</h4>
                          
                          {post.comments && post.comments.length > 0 && (
                            <div className="space-y-2">
                              {post.comments.map((comment) => (
                                <div key={comment._id} className="flex gap-2 p-2 bg-muted/50 rounded-lg">
                                  <Avatar className="size-6">
                                    {comment.authorAvatar ? (
                                      <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                                    ) : null}
                                    <AvatarFallback className="text-[10px] bg-secondary">
                                      {comment.authorName?.charAt(0).toUpperCase() || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-0.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <Link href={`/community/profile/${comment.authorId}`} className="text-xs font-medium text-primary hover:underline">
                                          {escapeHtml(comment.authorName)}
                                        </Link>
                                        <span className="text-[10px] text-muted-foreground">
                                          {formatDistanceToNow(new Date(comment.createdAt))}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs">{escapeHtml(comment.content)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Input
                              placeholder="Write your answer..."
                              value={newComment[post._id] || ""}
                              onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                              onKeyDown={(e) => e.key === "Enter" && handleAddComment(post._id)}
                              className="flex-1 h-8 text-xs"
                            />
                            <Button size="sm" className="h-8" onClick={() => handleAddComment(post._id)}>
                              <Send className="size-3" />
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
