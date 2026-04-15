"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { 
  Loader2, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Pin,
  Heart,
  Award,
  ChevronLeft,
  ThumbsUp,
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
    ? posts.filter(p => !p.isPinned)
    : activeTab === "pinned"
    ? posts.filter(p => p.isPinned)
    : posts.filter(p => p.likes.length > 0);

  const renderPost = (post: Post, showAuthor = false) => (
    <div key={post._id} className="bg-card border rounded-lg overflow-hidden">
      <div className="flex">
        {/* Vote Column - StackOverflow Style */}
        <div className="w-16 bg-muted/30 flex flex-col items-center py-4 gap-2 border-r">
          <button className="flex flex-col items-center p-1 hover:bg-muted rounded transition-colors">
            <ThumbsUp className="size-6 text-muted-foreground hover:text-primary" />
            <span className="text-sm font-bold text-foreground">{post.likes.length}</span>
          </button>
          <div className="text-xs text-muted-foreground font-medium">likes</div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {post.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded mb-3">
              <Pin className="size-3" />
              Pinned
            </span>
          )}
          
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {escapeHtml(post.content)}
          </p>

          <div className="flex items-center gap-4 mt-4 pt-3 border-t text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageCircle className="size-4" />
              {post.comments.length} {post.comments.length === 1 ? "answer" : "answers"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-4" />
              asked {formatDistanceToNow(new Date(post.createdAt))}
            </span>
          </div>

          {/* Comments */}
          {post.comments.length > 0 && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-primary/30">
              {post.comments.map((comment) => (
                <div key={comment._id} className="text-sm">
                  <p className="text-foreground">{escapeHtml(comment.content)}</p>
                  <span className="text-xs text-muted-foreground">
                    — {comment.authorName} {formatDistanceToNow(new Date(comment.createdAt))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Author Card */}
        {showAuthor && (
          <div className="w-48 bg-muted/30 p-4 border-l">
            <div className="text-xs text-muted-foreground mb-2">asked {formatDistanceToNow(new Date(post.createdAt))}</div>
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden">
                {post.authorAvatar ? (
                  <Image src={post.authorAvatar} alt="" width={40} height={40} className="object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">{post.authorName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{escapeHtml(post.authorName)}</p>
                <p className="text-xs text-muted-foreground">{profileUser.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back Button */}
      <Link 
        href="/community" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to Community
      </Link>

      {/* Profile Header */}
      <div className="bg-card border rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="size-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
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

          {/* Stats Card */}
          <div className="bg-muted/50 rounded-xl p-4 min-w-[200px]">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats?.totalPosts || 0}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats?.totalLikes || 0}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats?.pinnedPosts || 0}</p>
                <p className="text-xs text-muted-foreground">Pinned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats?.totalComments || 0}</p>
                <p className="text-xs text-muted-foreground">Answers</p>
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
          <span className="flex items-center gap-2">
            <MessageCircle className="size-4" />
            Questions ({posts.filter(p => !p.isPinned).length})
          </span>
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
          filteredPosts.map((post) => renderPost(post, activeTab === "posts"))
        )}
      </div>
    </div>
  );
}