"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Pin, MessageCircle, Heart, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/community");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/community/post/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (e) {
      console.error(e);
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
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
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

  const stats = {
    total: posts.length,
    active: posts.filter(p => !p.expiresAt || new Date(p.expiresAt) > new Date()).length,
    expired: posts.filter(p => p.expiresAt && new Date(p.expiresAt) < new Date()).length,
    pinned: posts.filter(p => p.isPinned).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-muted-foreground">Manage community posts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pinned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pinned}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
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
        {filteredPosts.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No posts found</p>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
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
  );
}