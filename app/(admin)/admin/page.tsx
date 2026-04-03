"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, BarChart3, Award, TrendingUp, PieChart } from "lucide-react";
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
  Cell,
} from "recharts";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  progress?: {
    completedLessons: string[];
    completionPercentage?: number;
  };
  examAttempts?: {
    score: number;
    passed: boolean;
  }[];
  certificateIssued?: boolean;
  createdAt?: string;
}

interface Stats {
  totalUsers: number;
  avgExamScore: number;
  avgCompletionRate: number;
  certificatesIssued: number;
  registrationData?: { date: string; users: number }[];
  distribution?: { name: string; count: number; color: string }[];
}

function computeStats(users: UserRecord[]): Stats {
  const totalUsers = users.length;

  const completionRates = users.map((u) => u.progress?.completionPercentage ?? 0);
  const avgCompletionRate =
    totalUsers > 0
      ? Math.round(completionRates.reduce((a, b) => a + b, 0) / totalUsers)
      : 0;

  const usersWithAttempts = users.filter(
    (u) => u.examAttempts && u.examAttempts.length > 0
  );
  const bestScores = usersWithAttempts.map((u) =>
    Math.max(...(u.examAttempts ?? []).map((a) => a.score))
  );
  const avgExamScore =
    bestScores.length > 0
      ? Math.round(bestScores.reduce((a, b) => a + b, 0) / bestScores.length)
      : 0;

  const certificatesIssued = users.filter((u) => u.certificateIssued).length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const registrationData = last7Days.map((date) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    users: users.filter((u) => u.createdAt && u.createdAt.startsWith(date)).length,
  }));

  const distribution = [
    { name: "0-25%", count: users.filter(u => (u.progress?.completionPercentage ?? 0) <= 25).length, color: "#000000" }, 
    { name: "26-50%", count: users.filter(u => (u.progress?.completionPercentage ?? 0) > 25 && (u.progress?.completionPercentage ?? 0) <= 50).length, color: "#000000" }, 
    { name: "51-75%", count: users.filter(u => (u.progress?.completionPercentage ?? 0) > 50 && (u.progress?.completionPercentage ?? 0) <= 75).length, color: "#000000" }, 
    { name: "76-100%", count: users.filter(u => (u.progress?.completionPercentage ?? 0) > 75).length, color: "#000000" }, 
  ];

  return { 
    totalUsers, 
    avgExamScore, 
    avgCompletionRate, 
    certificatesIssued,
    registrationData,
    distribution
  };
}

interface DashboardStats extends Stats {
  registrationData: { date: string; users: number }[];
  distribution: { name: string; count: number; color: string }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const users: UserRecord[] = await res.json();
        setStats(computeStats(users) as DashboardStats);
      } catch {
        // Fallback or empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      description: "Registered accounts",
    },
    {
      title: "Avg. Exam Score",
      value: stats ? `${stats.avgExamScore}%` : "—",
      icon: GraduationCap,
      description: "Based on best attempts",
    },
    {
      title: "Avg. Completion Rate",
      value: stats ? `${stats.avgCompletionRate}%` : "—",
      icon: BarChart3,
      description: "Course progress across users",
    },
    {
      title: "Certificates Issued",
      value: stats?.certificatesIssued ?? 0,
      icon: Award,
      description: "Students who passed",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of platform activity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {/* Registration Chart */}
        <Card className="p-4">
          <CardHeader className="px-2 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-blue-500" />
              <CardTitle className="text-sm font-semibold">User Growth</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">New registrations (Last 7 days)</p>
          </CardHeader>
          <CardContent className="h-[300px] p-0">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.registrationData}>
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
                    dataKey="users" 
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

        {/* Completion Chart */}
        <Card className="p-4">
          <CardHeader className="px-2 pb-4">
            <div className="flex items-center gap-2">
              <PieChart className="size-4 text-indigo-500" />
              <CardTitle className="text-sm font-semibold">Course Completion</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">User distribution by completion tier</p>
          </CardHeader>
          <CardContent className="h-[300px] p-0">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.distribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12} 
                    tick={{ fill: "#64748b" }}
                    width={70}
                  />
                  <Tooltip 
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {stats?.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
