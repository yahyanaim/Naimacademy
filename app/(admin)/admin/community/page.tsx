"use client";

import { useState, useEffect, useMemo } from "react";
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
  TrendingUp,
  Users,
  Award,
  Hash,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

interface UserStats {
  userId: string;
  name: string;
  postCount: number;
  answerCount: number;
  likeCount: number;
  saveCount: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "pinned">("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "all">("30d");

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

  const { userStats, tagStats, dailyData, hourlyData } = useMemo(() => {
    const userMap = new Map<string, UserStats>();
    const tagMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();
    const hourlyMap = new Map<number, number>();

    posts.forEach(post => {
      const userId = post.authorId;
      const existing = userMap.get(userId) || { userId, name: post.authorName, postCount: 0, answerCount: 0, likeCount: 0, saveCount: 0 };
      existing.postCount++;
      existing.likeCount += post.likes?.length || 0;
      userMap.set(userId, existing);

      post.comments?.forEach(comment => {
        const commenterId = comment.authorId;
        const commenter = userMap.get(commenterId) || { userId: commenterId, name: comment.authorName, postCount: 0, answerCount: 0, likeCount: 0, saveCount: 0 };
        commenter.answerCount++;
        userMap.set(commenterId, commenter);
      });

      post.tags?.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });

      const date = new Date(post.createdAt);
      const dateKey = date.toISOString().split("T")[0];
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);

      hourlyMap.set(date.getHours(), (hourlyMap.get(date.getHours()) || 0) + 1);
    });

    const now = new Date();
    let startDate = new Date(now);
    if (dateRange === "7d") startDate.setDate(now.getDate() - 7);
    else if (dateRange === "30d") startDate.setDate(now.getDate() - 30);

    const filteredPosts = posts.filter(p => new Date(p.createdAt) >= startDate);
    
    const userStats = Array.from(userMap.values())
      .sort((a, b) => (b.postCount + b.answerCount) - (a.postCount + a.answerCount))
      .slice(0, 10);

    const tagStats = Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const dailyData = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, count]) => ({ date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), posts: count }));

    const hourlyData = Array.from(hourlyMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([hour, count]) => ({ 
        hour: `${hour.toString().padStart(2, "0")}:00`, 
        posts: count 
      }));

    return { userStats, tagStats, dailyData, hourlyData };
  }, [posts, dateRange]);

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
  const avgAnswersPerPost = posts.length > 0 ? (totalComments / posts.length).toFixed(1) : "0";
  const avgLikesPerPost = posts.length > 0 ? (totalLikes / posts.length).toFixed(1) : "0";

  const cards = [
    { title: "Total Posts", value: posts.length, icon: FileText, description: "All community questions", detail: "The total number of questions posted." },
    { title: "Active Posts", value: activePosts, icon: MessageSquare, description: "Questions within 24h", detail: "Questions still viewable in the feed." },
    { title: "Expired", value: expiredPosts, icon: Clock, description: "Questions after 24h", detail: "Questions past their 24-hour window." },
    { title: "Pinned", value: pinnedPosts, icon: Pin, description: "Featured questions", detail: "Questions pinned for visibility." },
    { title: "Avg Answers/Post", value: avgAnswersPerPost, icon: TrendingUp, description: "Answers per question", detail: "Average engagement per post." },
    { title: "Avg Likes/Post", value: avgLikesPerPost, icon: Heart, description: "Likes per question", detail: "Average likes per post." },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Detailed insights and control over your community
        </p>
      </div>

      {/* Quick Overview */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="size-5" />
            Quick Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ title, value, icon: Icon, description, detail }) => (
            <Card key={title} className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Daily Activity</CardTitle>
              <div className="flex gap-1">
                {(["7d", "30d", "all"] as const).map((d) => (
                  <Button key={d} variant={dateRange === d ? "default" : "ghost"} size="sm" onClick={() => setDateRange(d)}>
                    {d}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tag Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tagStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="name"
                >
                  {tagStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users & Hourly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userStats.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="size-3" />{user.postCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="size-3" />{user.answerCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Posting Time (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="posts" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* All Posts Management */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="size-5" />
            Manage Posts
          </h2>
        </div>

        <div className="flex gap-2 mb-4">
          {(["all", "active", "expired", "pinned"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
              {f}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
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
                          <Badge className="bg-primary"><Pin className="size-3 mr-1" />Pinned</Badge>
                        )}
                        <Badge variant={post.expiresAt && new Date(post.expiresAt) < new Date() ? "destructive" : "secondary"}>
                          {post.expiresAt && new Date(post.expiresAt) < new Date() ? "Expired" : "Active"}
                        </Badge>
                        {post.tags.map((tag) => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                      </div>
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="size-3" />{post.likes?.length || 0}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="size-3" />{post.comments?.length || 0}</span>
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