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
  MoreHorizontal
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

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "now";
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  const activityData = posts.map(p => ({
    date: new Date(p.createdAt).toISOString().split('T')[0],
    count: 1
  }));

  const activityMap = new Map<string, number>();
  activityData.forEach(item => {
    activityMap.set(item.date, (activityMap.get(item.date) || 0) + item.count);
  });

  const generateGrid = () => {
    const cells = [];
    const today = new Date();
    for (let i = 53; i >= 0; i--) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (i * 7 + (6 - j)));
        const dateStr = date.toISOString().split('T')[0];
        const count = activityMap.get(dateStr) || 0;
        week.push({ date: dateStr, count, isToday: dateStr === today.toISOString().split('T')[0] });
      }
      cells.push(week);
    }
    return cells;
  };

  const getIntensityColor = (count: number) => {
    if (count === 0) return "bg-muted/50";
    if (count === 1) return "bg-green-300";
    if (count === 2) return "bg-green-400";
    if (count === 3) return "bg-green-500";
    return "bg-green-600";
  };

  const totalContributions = posts.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/community" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-none">{profileUser.name}</h1>
            <p className="text-sm text-muted-foreground">{posts.length} questions</p>
          </div>
        </div>
      </div>

      {/* Profile Header - Twitter Style */}
      <div className="max-w-2xl mx-auto">
        {/* GitHub-style Activity Banner */}
        <div className="h-40 bg-card border-b p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Activity</h3>
            <span className="text-xs text-muted-foreground">{totalContributions} contributions this year</span>
          </div>
          <div className="flex gap-[3px] overflow-hidden rounded">
            {generateGrid().map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`size-3 rounded-sm ${getIntensityColor(day.count)} ${day.isToday ? 'ring-1 ring-primary' : ''}`}
                    title={`${day.date}: ${day.count} question${day.count !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="size-3 rounded-sm bg-muted/50" />
              <div className="size-3 rounded-sm bg-green-300" />
              <div className="size-3 rounded-sm bg-green-400" />
              <div className="size-3 rounded-sm bg-green-500" />
              <div className="size-3 rounded-sm bg-green-600" />
            </div>
            <span>More</span>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="size-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
              {profileUser.avatar ? (
                <Image src={profileUser.avatar} alt="" width={96} height={96} className="object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{profileUser.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <Button variant="outline" size="sm" className="rounded-full font-bold">
              Follow
            </Button>
          </div>

          <div className="mb-4">
            <h2 className="font-bold text-xl leading-none mb-1">{profileUser.name}</h2>
            <p className="text-muted-foreground text-sm">@{profileUser.name.toLowerCase().replace(/\s+/g, "")}</p>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Member since {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>

          {/* Stats */}
          <div className="flex gap-5">
            <span className="text-sm">
              <span className="font-bold">{stats?.totalPosts || 0}</span>
              <span className="text-muted-foreground ml-1">Questions</span>
            </span>
            <span className="text-sm">
              <span className="font-bold">{stats?.totalLikes || 0}</span>
              <span className="text-muted-foreground ml-1">Votes</span>
            </span>
            <span className="text-sm">
              <span className="font-bold">{stats?.totalComments || 0}</span>
              <span className="text-muted-foreground ml-1">Answers</span>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${
              activeTab === "posts" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Questions
            {activeTab === "posts" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab("pinned")}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${
              activeTab === "pinned" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Pinned
            {activeTab === "pinned" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${
              activeTab === "likes" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Liked
            {activeTab === "likes" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />}
          </button>
        </div>

        {/* Posts */}
        <div className="divide-y">
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {activeTab === "posts" && "No questions yet"}
                {activeTab === "pinned" && "No pinned posts"}
                {activeTab === "likes" && "No liked posts"}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article key={post._id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex gap-3">
                  {/* Author Avatar */}
                  <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {post.authorAvatar ? (
                      <Image src={post.authorAvatar} alt="" width={40} height={40} className="object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white">{post.authorName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold hover:underline">{post.authorName}</span>
                      <span className="text-muted-foreground text-sm">@{post.authorName.toLowerCase().replace(/\s+/g, "")}</span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm hover:underline">{formatDistanceToNow(new Date(post.createdAt))}</span>
                      {post.isPinned && (
                        <Pin className="size-3.5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Text */}
                    <Link href={`/community/post/${post._id}`} className="block group">
                      <p className="text-[15px] leading-relaxed mb-2 group-hover:text-primary/80 transition-colors">
                        {escapeHtml(post.content)}
                      </p>
                    </Link>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag} 
                            className="text-[15px] text-blue-500 hover:underline"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 mt-2 -ml-2">
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-500 group">
                        <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                          <MessageCircle className="size-5" />
                        </div>
                        <span className="text-sm">{post.comments.length}</span>
                      </button>
                      <button className={`flex items-center gap-1.5 group ${post.likes.length > 0 ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
                        <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                          <Heart className={`size-5 ${post.likes.length > 0 ? "fill-current" : ""}`} />
                        </div>
                        <span className="text-sm">{post.likes.length}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 group">
                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                          <Pin className={`size-5 ${post.isPinned ? "fill-current" : ""}`} />
                        </div>
                      </button>
                      <button className="p-2 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
                        <MoreHorizontal className="size-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
