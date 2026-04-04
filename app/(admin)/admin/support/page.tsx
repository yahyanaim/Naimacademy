"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, ChevronDown, ChevronRight, Mail } from "lucide-react";
import { toast } from "sonner";

interface Message {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const res = await fetch("/api/admin/support");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  const threads = messages.reduce<Record<string, { userId: string; messages: Message[] }>>((acc, msg) => {
    const key = msg.userId;
    if (!acc[key]) acc[key] = { userId: msg.userId, messages: [] };
    acc[key].messages.push(msg);
    return acc;
  }, {});

  function toggleThread(id: string) {
    setExpandedThreads((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleReply(userId: string) {
    const threadMsgs = threads[userId]?.messages || [];
    const firstUserMsg = threadMsgs.find((m) => !m.isAdmin);
    if (!firstUserMsg) return;

    const text = replyText[userId]?.trim();
    if (!text) return;

    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: firstUserMsg._id, message: text }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to send reply");
        return;
      }

      setReplyText((prev) => ({ ...prev, [userId]: "" }));
      toast.success("Reply sent");
      await fetchMessages();
    } catch {
      toast.error("Failed to send reply");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <MessageSquare className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No Support Messages</h2>
        <p className="text-muted-foreground mt-1">Student messages will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Messages</h1>
        <p className="text-muted-foreground mt-1">View and reply to student support requests</p>
      </div>

      <div className="space-y-4">
        {Object.entries(threads).map(([userId, { messages: threadMessages }]) => {
          const userMsg = threadMessages.find((m) => !m.isAdmin);
          const isExpanded = expandedThreads[userId];
          return (
            <Card key={userId}>
              <button
                onClick={() => toggleThread(userId)}
                className="w-full text-left"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Mail className="size-4 text-muted-foreground" />
                          {userMsg?.userName || "User"}
                        </CardTitle>
                        <CardDescription className="mt-0.5">
                          {userMsg?.userEmail || "No email"} &middot; {threadMessages.length} message{threadMessages.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(threadMessages[0].createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
              </button>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {threadMessages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            msg.isAdmin
                              ? "bg-muted text-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${msg.isAdmin ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      value={replyText[userId] || ""}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [userId]: e.target.value }))}
                      placeholder="Type your reply..."
                      className="text-sm min-h-[60px]"
                    />
                    <Button
                      onClick={() => handleReply(userId)}
                      size="icon"
                      className="shrink-0 self-end"
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
