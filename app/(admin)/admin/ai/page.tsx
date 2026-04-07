"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, TrendingUp, Calendar, Search } from "lucide-react";
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

interface AIStats {
  totalQuestions: number;
  usersWithAIUsage: number;
  avgQuestionsPerUser: number;
  dailyData: { date: string; questions: number }[];
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
      name: u.name || u.email,
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const users: UserRecord[] = await res.json();
        setStats(computeAIStats(users));
      } catch {
        // Fallback or empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredQuestions = stats?.allQuestions.filter(q => 
    q.name.toLowerCase().includes(search.toLowerCase()) ||
    q.question.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

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
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant Statistics</h1>
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

      <Card className="p-4">
        <CardHeader className="px-2 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-black" />
            <CardTitle className="text-sm font-semibold">Questions Over Time</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">Last 14 days</p>
        </CardHeader>
        <CardContent className="h-[300px] p-0">
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              <CardTitle className="text-sm font-semibold">All Questions</CardTitle>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border rounded-md w-48"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : filteredQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions found.</p>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{q.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(q.answeredAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{q.question}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
