"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Loader2, 
  Trash2, 
  Pin, 
  MessageCircle, 
  Heart,
  BarChart3,
  Clock,
  FileText,
  MessageSquare,
  PinOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Post {
  _id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  likes: string[];
  saved: string[];
  comments: any[];
  createdAt: string;
  expiresAt: string;
}

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "pinned">("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/community");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const deletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/community/post/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch {
      // Error
    }
  };

  const togglePin = async (postId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pin", postId }),
      });
      if (res.ok) {
        const res = await fetch("/api/admin/community");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      }
    } catch {
      // Error
    }
  };

  const filteredPosts = posts.filter(post => {
    const now = new Date();
    const expired = post.expiresAt && new Date(post.expiresAt) < now;
    
    if (filter === "active") return !expired && !post.isPinned;
    if (filter === "expired") return expired;
    if (filter === "pinned") return post.isPinned;
    return true;
  });

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
  const totalSaves = posts.reduce((sum, p) => sum + (p.saved?.length || 0), 0);
  const activePosts = posts.filter(p => !p.expiresAt || new Date(p.expiresAt) > new Date()).length;
  const expiredPosts = posts.filter(p => p.expiresAt && new Date(p.expiresAt) < new Date()).length;
  const pinnedPosts = posts.filter(p => p.isPinned).length;

  const cards = [
    {
      title: "Total Posts",
      value: posts.length,
      icon: FileText,
      description: "All community questions",
      detail: "The total number of questions posted to the community. This includes all active and expired posts.",
    },
    {
      title: "Active Posts",
      value: activePosts,
      icon: MessageSquare,
      description: "Questions within 24h",
      detail: "Questions that are still viewable and have not yet expired after 24 hours.",
    },
    {
      title: "Expired",
      value: expiredPosts,
      icon: Clock,
      description: "Questions after 24h",
      detail: "Questions that have passed their 24-hour window but may still show in saved.",
    },
    {
      title: "Pinned",
      value: pinnedPosts,
      icon: Pin,
      description: "Featured questions",
      detail: "Questions that have been pinned to the top by admins for visibility.",
    },
    {
      title: "Total Likes",
      value: totalLikes,
      icon: Heart,
      description: "Across all posts",
      detail: "Total number of likes received on all community questions.",
    },
    {
      title: "Total Answers",
      value: totalComments,
      icon: MessageCircle,
      description: "Community responses",
      detail: "Total number of answers/comments on all questions.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor community questions and engagement
        </p>
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="size-5" />
            Quick Overview
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Key metrics showing the current state of your community at a glance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ title, value, icon: Icon, description, detail }) => (
            <Card key={title} className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {description}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-2 italic">
                      {detail}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="size-5" />
            All Posts
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and manage community questions.
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          {(["all", "active", "expired", "pinned"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">No posts found</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post._id} className="transition-all duration-200 hover:shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {post.isPinned && (
                          <Badge className="bg-primary">
                            <Pin className="size-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        <Badge variant={post.expiresAt && new Date(post.expiresAt) < new Date() ? "destructive" : "secondary"}>
                          {post.expiresAt && new Date(post.expiresAt) < new Date() ? "Expired" : "Active"}
                        </Badge>
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline">#{tag}</Badge>
                        ))}
                      </div>
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="size-3" />
                          {post.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="size-3" />
                          {post.comments?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Pin className="size-3" />
                          {post.saved?.length || 0}
                        </span>
                        <span>{post.authorName}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => togglePin(post._id)}>
                        <Pin className={`size-4 ${post.isPinned ? "fill-current" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deletePost(post._id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}