"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Search, User, Mail, Clock } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMessages() {
    try {
      const res = await fetch("/api/admin/support");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(data.messages || []);
      setLastUpdate(new Date().toLocaleTimeString());
      
      if (!selectedUser && data.messages && data.messages.length > 0) {
        const latestMsg = data.messages.reduce((latest: Message | null, msg: Message) => {
          if (!latest) return msg;
          return new Date(msg.createdAt) > new Date(latest.createdAt) ? msg : latest;
        }, null);
        if (latestMsg) {
          setSelectedUser(latestMsg.userId);
        }
      }
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  const threads = messages.reduce<Record<string, { userId: string; userName: string; userEmail: string; messages: Message[] }>>((acc, msg) => {
    const key = msg.userId;
    if (!acc[key]) acc[key] = { userId: msg.userId, userName: msg.userName, userEmail: msg.userEmail, messages: [] };
    acc[key].messages.push(msg);
    return acc;
  }, {});

  const filteredThreads = Object.values(threads).filter((t) => {
    const userMsg = t.messages.find((m) => !m.isAdmin);
    const searchLower = search.toLowerCase();
    return (
      t.userName.toLowerCase().includes(searchLower) ||
      t.userEmail.toLowerCase().includes(searchLower) ||
      userMsg?.message.toLowerCase().includes(searchLower)
    );
  });

  const selectedThread = selectedUser ? threads[selectedUser] : null;

  async function handleReply() {
    if (!selectedUser || !replyText.trim()) return;

    const threadMsgs = threads[selectedUser]?.messages || [];
    const firstUserMsg = threadMsgs.find((m) => !m.isAdmin);
    if (!firstUserMsg) return;

    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: firstUserMsg._id, message: replyText.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to send reply");
        return;
      }

      setReplyText("");
      toast.success("Reply sent");
      await fetchMessages();
    } catch {
      toast.error("Failed to send reply");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage student support requests</p>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <MessageSquare className="size-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No messages yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Student messages will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Thread List */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-gray-50 dark:bg-gray-800 border-none"
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[70vh] overflow-y-auto">
                {filteredThreads.map((thread) => {
                  const userMsg = thread.messages.find((m) => !m.isAdmin);
                  const lastMsg = thread.messages[thread.messages.length - 1];
                  const isSelected = selectedUser === thread.userId;
                  return (
                    <button
                      key={thread.userId}
                      onClick={() => setSelectedUser(thread.userId)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        isSelected ? "bg-primary/5 dark:bg-primary/10" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        }`}>
                          <User className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-medium truncate ${isSelected ? "text-primary" : "text-gray-900 dark:text-white"}`}>
                              {thread.userName || "User"}
                            </p>
                            <span className="text-xs text-gray-400 shrink-0">
                              {new Date(lastMsg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {userMsg?.message || "No message"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {thread.messages.length} message{thread.messages.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat View */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
              {selectedThread ? (
                <>
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <User className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedThread.userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="size-3" />
                          {selectedThread.userEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 space-y-4 max-h-[50vh] overflow-y-auto">
                    {selectedThread.messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                            msg.isAdmin
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              : "bg-primary text-white"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${msg.isAdmin ? "text-gray-400" : "text-white/60"}`}>
                            <Clock className="size-3" />
                            {new Date(msg.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-3">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="min-h-[60px] bg-gray-50 dark:bg-gray-800 border-none resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.metaKey) handleReply();
                        }}
                      />
                      <Button
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                        className="shrink-0 h-auto px-4"
                      >
                        <Send className="size-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Press Cmd+Enter to send</p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-12">
                  <div>
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="size-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
