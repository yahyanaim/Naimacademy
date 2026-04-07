"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, TrendingUp, Search, User, Mail, Clock, Send, RefreshCw, Calendar } from "lucide-react";
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
  createdAt?: string;
}

interface Thread {
  userId: string;
  userName: string;
  userEmail: string;
  questions: { question: string; answeredAt: string }[];
}

function computeThreads(users: UserRecord[]) {
  return users
    .filter(u => u.chatQuestions && u.chatQuestions.length > 0)
    .map(u => ({
      userId: u._id,
      userName: u.name || u.email,
      userEmail: u.email,
      questions: u.chatQuestions || [],
    }))
    .sort((a, b) => {
      const aDate = a.questions[0]?.answeredAt || "";
      const bDate = b.questions[0]?.answeredAt || "";
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

function computeStats(users: UserRecord[]) {
  const totalQuestions = users.reduce((sum, u) => sum + (u.chatQuestions?.length ?? 0), 0);
  const usersWithAIUsage = users.filter(u => u.chatQuestions && u.chatQuestions.length > 0).length;
  const avgQuestionsPerUser = usersWithAIUsage > 0 ? Math.round(totalQuestions / usersWithAIUsage * 10) / 10 : 0;

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const dailyData = last14Days.map((date) => {
    const questions = users.reduce((sum, u) => {
      const dayQuestions = u.chatQuestions?.filter(q => q.answeredAt && q.answeredAt.startsWith(date)).length ?? 0;
      return sum + dayQuestions;
    }, 0);
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      questions,
    };
  });

  return { totalQuestions, usersWithAIUsage, avgQuestionsPerUser, dailyData };
}

export default function AIStatsPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: UserRecord[] = await res.json();
      setUsers(data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = computeStats(users);
  const threads = computeThreads(users);

  const filteredThreads = threads.filter(t => {
    const searchLower = search.toLowerCase();
    return (
      t.userName.toLowerCase().includes(searchLower) ||
      t.userEmail.toLowerCase().includes(searchLower) ||
      t.questions.some(q => q.question.toLowerCase().includes(searchLower))
    );
  });

  const selectedThread = selectedUser ? threads.find(t => t.userId === selectedUser) : null;

  const cards = [
    { title: "Total Questions", value: stats.totalQuestions, icon: MessageSquare, description: "AI questions asked" },
    { title: "Active Users", value: stats.usersWithAIUsage, icon: Users, description: "Students used AI" },
    { title: "Avg. Questions", value: stats.avgQuestionsPerUser, icon: TrendingUp, description: "Per user" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Assistant Questions</h1>
          <p className="text-muted-foreground text-sm">Student questions with auto-refresh</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && <span className="text-xs text-muted-foreground">Updated: {lastUpdate}</span>}
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ title, value, icon: Icon, description }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
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
        </CardHeader>
        <CardContent className="h-[200px] p-0">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="questions" stroke="#000000" strokeWidth={2.5} dot={{ fill: "#000000", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : filteredThreads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No questions found</p>
            ) : (
              <div className="space-y-1">
                {filteredThreads.map((thread) => (
                  <button
                    key={thread.userId}
                    onClick={() => setSelectedUser(thread.userId)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedUser === thread.userId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="size-4 shrink-0" />
                      <span className="font-medium text-sm truncate">{thread.userName}</span>
                    </div>
                    <p className="text-xs truncate mt-1 opacity-80">{thread.questions[0]?.question || "No questions"}</p>
                    <p className="text-xs opacity-60 mt-1">{thread.questions.length} question{thread.questions.length !== 1 ? "s" : ""}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {selectedThread ? (
            <>
              <CardHeader className="pb-2 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span className="font-semibold">{selectedThread.userName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="size-3" />
                  {selectedThread.userEmail}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedThread.questions.map((q, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="size-4 text-primary" />
                      <span className="text-xs font-medium">Question</span>
                      <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(q.answeredAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{q.question}</p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="size-12 mx-auto mb-2 opacity-50" />
                <p>Select a student to view their questions</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}