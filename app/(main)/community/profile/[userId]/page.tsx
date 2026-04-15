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
  ArrowLeft,
  Clock,
  Award,
  MessageSquare,
  ThumbsUp
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

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

const tagColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

function getTagColor(tag: string): string {
  return tagColors[tag.length % tagColors.length];
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

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/community" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="size-4" />
          Back to Community
        </Link>

        {/* Profile Header Card */}
        <div className="bg-card border rounded-2xl overflow-hidden mb-6">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              {/* Avatar */}
              <div className="size-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden shadow-xl border-4 border-card z-10">
                {profileUser.avatar ? (
                  <Image src={profileUser.avatar} alt="" width={96} height={96} className="object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">{profileUser.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                <p className="text-muted-foreground text-sm">{profileUser.email}</p>
                <div className="flex items-center gap-4 mt-2 justify-center sm:justify-start text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    Joined {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <MessageSquare className="size-5" />
                  <span className="text-2xl font-bold">{stats?.totalPosts || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                  <ThumbsUp className="size-5" />
                  <span className="text-2xl font-bold">{stats?.totalLikes || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Votes Received</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
                  <MessageCircle className="size-5" />
                  <span className="text-2xl font-bold">{stats?.totalComments || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Answers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "posts" 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setActiveTab("pinned")}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "pinned" 
                ? "bg-black text-white shadow-md" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Pin className="size-4" />
            Pinned
          </button>
          <button
            onClick={() => setActiveTab("likes")}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "likes" 
                ? "bg-red-500 text-white shadow-md" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Heart className="size-4" />
            Liked
          </button>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-card border rounded-xl p-12 text-center">
              <MessageCircle className="size-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">
                {activeTab === "posts" && "No questions yet"}
                {activeTab === "pinned" && "No pinned posts"}
                {activeTab === "likes" && "No liked posts"}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post._id} className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    {/* Stats */}
                    <div className="flex flex-col items-center gap-3 min-w-[60px]">
                      <div className={`flex flex-col items-center p-2 rounded-lg ${post.likes.length > 0 ? "bg-red-50" : "bg-muted/50"}`}>
                        <Heart className={`size-5 ${post.likes.length > 0 ? "text-red-500 fill-current" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-bold ${post.likes.length > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                          {post.likes.length}
                        </span>
                      </div>
                      <div className={`flex flex-col items-center p-2 rounded-lg ${post.comments.length > 0 ? "bg-green-50" : "bg-muted/50"}`}>
                        <MessageCircle className={`size-5 ${post.comments.length > 0 ? "text-green-600" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-bold ${post.comments.length > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                          {post.comments.length}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {post.isPinned && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-black text-white px-2 py-0.5 rounded">
                            <Pin className="size-3" />
                            Pinned
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDistanceToNow(new Date(post.createdAt))}
                        </span>
                      </div>
                      
                      <Link href={`/community/post/${post._id}`} className="block group">
                        <p className="text-base leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                          {escapeHtml(post.content)}
                        </p>
                      </Link>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <span 
                              key={tag} 
                              className={`px-2.5 py-1 text-xs rounded-full ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden">
                        {post.authorAvatar ? (
                          <Image src={post.authorAvatar} alt="" width={28} height={28} className="object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white">{post.authorName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{post.authorName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {post.comments.length} {post.comments.length === 1 ? "answer" : "answers"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
