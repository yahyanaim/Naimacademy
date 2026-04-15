"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Send, Loader2, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatMessage {
  _id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export default function CommunityChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/community?type=chat&limit=100");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, fetchMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [user, fetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          content: newMessage,
          authorName: user?.name,
          authorEmail: user?.email,
          authorAvatar: user?.avatar,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      } else {
        toast.error("Failed to send message");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const groupedMessages = messages.reduce((groups: { [key: string]: ChatMessage[] }, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="bg-card border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Users className="size-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base">Group Chat</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-green-500" />
              Active now
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <MessageCircle className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm">Start the conversation</h3>
            <p className="text-muted-foreground text-xs mt-1 max-w-xs">
              Be the first to say hello!
            </p>
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Divider */}
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground font-medium px-2">
                    {date === new Date().toLocaleDateString() ? "Today" : date}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-3">
                  {dateMessages.map((message) => {
                    const isOwn = message.authorId === user?.id;
                    return (
                      <div
                        key={message._id}
                        className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                      >
                        {/* Avatar */}
                        {!isOwn && (
                          <div className="size-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                            {message.authorAvatar ? (
                              <Image src={message.authorAvatar} alt="" width={28} height={28} className="object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-white">
                                {message.authorName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                          {/* Name & Time */}
                          {!isOwn && (
                            <div className="flex items-center gap-1.5 mb-1 ml-0.5">
                              <span className="text-xs font-semibold">{escapeHtml(message.authorName)}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatTimeAgo(message.createdAt)}
                              </span>
                            </div>
                          )}

                          {/* Bubble */}
                          <div
                            className={`px-3 py-2 rounded-xl shadow-sm text-sm ${
                              isOwn
                                ? "bg-primary text-white rounded-br-md"
                                : "bg-card border rounded-bl-md"
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">
                              {escapeHtml(message.content)}
                            </p>
                          </div>

                          {/* Time for own messages */}
                          {isOwn && (
                            <span className="text-[10px] text-muted-foreground mt-0.5 mr-0.5 block text-right">
                              {formatTimeAgo(message.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="bg-card border-t p-3">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="w-full px-3 py-2 pr-10 border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <Button
            size="icon"
            className="rounded-full size-9"
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}