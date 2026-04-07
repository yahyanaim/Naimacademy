"use client";

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, TrendingUp, Calendar, Send, RefreshCw, User, MessageCircle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface ChatQuestion {
  question: string;
  answeredAt: string;
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  chatQuestions?: ChatQuestion[];
}

interface ChatMessage {
  id: string;
  studentName: string;
  question: string;
  answeredAt: string;
}

function computeAIStats(users: UserRecord[]) {
  const totalQuestions = users.reduce(
    (sum, u) => sum + (u.chatQuestions?.length ?? 0),
    0
  );
  const usersWithAIUsage = users.filter(
    (u) => u.chatQuestions && u.chatQuestions.length > 0
  ).length;
  const avgQuestionsPerUser = usersWithAIUsage > 0 
    ? Math.round(totalQuestions / usersWithAIUsage * 10) / 10 
    : 0;

  const allQuestions = users.flatMap(u => 
    (u.chatQuestions || []).map(q => ({
      id: `${u._id}-${q.answeredAt}`,
      studentName: u.name || u.email,
      question: q.question,
      answeredAt: q.answeredAt,
    }))
  ).sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime());

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const dailyData = last14Days.map((date) => {
    const questions = users.reduce((sum, u) => {
      const dayQuestions = u.chatQuestions?.filter(
        (q) => q.answeredAt && q.answeredAt.startsWith(date)
      ).length ?? 0;
      return sum + dayQuestions;
    }, 0);
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      questions,
    };
  });

  return {
    totalQuestions,
    usersWithAIUsage,
    avgQuestionsPerUser,
    dailyData,
    allQuestions,
  };
}

export default function AIStatsPage() {
  const [stats, setStats] = useState<ReturnType<typeof computeAIStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const users: UserRecord[] = await res.json();
      setStats(computeAIStats(users));
      setLastUpdate(new Date().toLocaleTimeString());
    } catch {
      // Fallback or empty state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stats?.allQuestions]);

  const cards = [
    {
      title: "Total Questions",
      value: stats?.totalQuestions ?? 0,
      icon: MessageSquare,
      description: "AI assistant questions asked",
    },
    {
      title: "Active Users",
      value: stats?.usersWithAIUsage ?? 0,
      icon: Users,
      description: "Students who used AI",
    },
    {
      title: "Avg. Questions",
      value: stats?.avgQuestionsPerUser ?? 0,
      icon: TrendingUp,
      description: "Questions per active user",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">AI Assistant Statistics</h1>
          <div className="flex items-center gap-2">
            {lastUpdate && <span className="text-xs text-muted-foreground">Updated: {lastUpdate}</span>}
            <button onClick={load} className="p-1 hover:bg-muted rounded">
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Track AI chat usage and engagement
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ title, value, icon: Icon, description }) => (
          <Card key={title}>
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
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardHeader className="px-2 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-black" />
              <CardTitle className="text-sm font-semibold">Questions Over Time</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Last 14 days</p>
          </CardHeader>
          <CardContent className="h-[250px] p-0">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12} 
                    tick={{ fill: "#64748b" }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12} 
                    tick={{ fill: "#64748b" }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="questions" 
                    stroke="#000000" 
                    strokeWidth={2.5} 
                    dot={{ fill: "#000000", strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[350px]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4" />
              <CardTitle className="text-sm font-semibold">AI Questions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : stats?.allQuestions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No questions yet
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-4 space-y-3">
                {stats?.allQuestions.map((msg, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="size-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">{msg.studentName}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(msg.answeredAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.question}</p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
