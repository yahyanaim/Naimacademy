"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { 
  Loader2, 
  Calendar, 
  MessageCircle, 
  Pin,
  Heart,
  ChevronLeft,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

interface UserStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  pinnedPosts: number;
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

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "pinned" | "likes">("posts");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfileUser(data.user);
        setPosts(data.posts || []);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">User not found</h2>
          <Link href="/community" className="text-primary mt-2 inline-block">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const filteredPosts = activeTab === "posts" 
    ? posts
    : activeTab === "pinned"
    ? posts.filter(p => p.isPinned)
    : posts.filter(p => p.likes.length > 0);

  const renderPost = (post: Post) => (
    <div key={post._id} className="bg-card border rounded-lg overflow-hidden">
      <div className="flex">
        {/* Stats Column - StackOverflow Style */}
        <div className="w-16 bg-muted/30 flex flex-col items-center py-4 gap-3 border-r">
          <div className="text-center">
            <div className={`flex flex-col items-center p-1 rounded ${
              post.likes.length > 0 ? "text-red-500" : "text-muted-foreground"
            }`}>
              <Heart className={`size-5 ${post.likes.length > 0 ? "fill-current" : ""}`} />
              <span className="text-xs font-bold">{post.likes.length}</span>
            </div>
          </div>

          <div className={`text-center p-1 rounded ${post.comments.length > 0 ? "bg-green-100 text-green-700" : ""}`}>
            <div className={`flex flex-col items-center ${post.comments.length > 0 ? "" : "text-muted-foreground"}`}>
              <MessageCircle className="size-4" />
              <span className="text-xs font-bold">{post.comments.length}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {post.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-black bg-black/10 px-2 py-1 rounded mb-2">
              <Pin className="size-3" />
              Pinned
            </span>
          )}
          
          <p className="text-base leading-relaxed whitespace-pre-wrap">{escapeHtml(post.content)}</p>

          {/* Tags */}
          {(post.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(post.tags || []).map(tag => (
                <span 
                  key={tag} 
                  className="px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3" />
              {post.comments.length} answers
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              asked {formatDistanceToNow(new Date(post.createdAt))}
            </span>
          </div>
        </div>

        {/* Author Card - Only show on own profile for consistency */}
        <div className="w-44 bg-muted/20 p-3 border-l">
          <div className="text-[11px] text-muted-foreground mb-2">
            asked {formatDistanceToNow(new Date(post.createdAt))}
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden flex-shrink-0">
              {post.authorAvatar ? (
                <Image src={post.authorAvatar} alt="" width={32} height={32} className="object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{post.authorName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-xs font-medium">{escapeHtml(post.authorName)}</p>
              <p className="text-[10px] text-muted-foreground">{post.likes.length} votes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <Link 
        href="/community" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to Community
      </Link>

      {/* Profile Header */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="size-24 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
            {profileUser.avatar ? (
              <Image src={profileUser.avatar} alt="" width={96} height={96} className="object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{profileUser.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profileUser.name}</h1>
            <p className="text-muted-foreground">{profileUser.email}</p>
            
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                Member since {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Stats Card - StackOverflow Style */}
          <div className="bg-muted/50 rounded-lg p-4 min-w-[180px]">
            <div className="text-xs text-muted-foreground mb-3 font-medium">STATS</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{stats?.totalPosts || 0}</span>
                <span className="text-sm font-medium">questions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{stats?.totalLikes || 0}</span>
                <span className="text-sm font-medium">votes received</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{stats?.totalComments || 0}</span>
                <span className="text-sm font-medium">answers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "posts" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Questions ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("pinned")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "pinned" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <Pin className="size-4" />
            Pinned ({posts.filter(p => p.isPinned).length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("likes")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "likes" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <Heart className="size-4" />
            Liked ({posts.filter(p => p.likes.length > 0).length})
          </span>
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-card border rounded-lg p-8 text-center">
            <MessageCircle className="size-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">
              {activeTab === "posts" && "No questions yet"}
              {activeTab === "pinned" && "No pinned posts"}
              {activeTab === "likes" && "No liked posts"}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => renderPost(post))
        )}
      </div>
    </div>
  );
}