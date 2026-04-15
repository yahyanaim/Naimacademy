"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  MessageCircle,
  Users, 
  Settings, 
  LogOut, 
  GraduationCap,
  Loader2,
  Bookmark,
  Send,
  X,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface ChatMessage {
  _id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

const navItems = [
  { label: "Home", href: "/community", icon: Home },
  { label: "Saved", href: "/community/saved", icon: Bookmark },
];

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

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedChat = useRef(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchMessages = useCallback(async () => {
    if (!chatOpen || hasFetchedChat.current) return;
    hasFetchedChat.current = true;
    
    try {
      const res = await fetch("/api/community?type=chat&limit=50");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [chatOpen]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (chatOpen) {
      hasFetchedChat.current = false;
      fetchMessages();
    }
  }, [chatOpen, fetchMessages]);

  useEffect(() => {
    if (chatOpen && messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatOpen, messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          content: newMessage,
          authorName: user.name,
          authorEmail: user.email,
          authorAvatar: user.avatar,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        const msgRes = await fetch("/api/community?type=chat&limit=50");
        if (msgRes.ok) {
          const data = await msgRes.json();
          setMessages(data.messages || []);
        }
      }
    } catch {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-muted/30">
      {/* Left Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col fixed left-0 top-14 bottom-0 z-30 hidden md:flex">
        {/* Logo/Brand */}
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <GraduationCap className="size-4 text-white" />
            </div>
            <span>Community</span>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="size-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <Image src={user.avatar} alt="" width={48} height={48} className="object-cover" />
              ) : (
                <span className="text-lg font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}

          {/* Chat Toggle Button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              chatOpen
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <MessageCircle className="size-5" />
            Chat
            {!chatOpen && (
              <span className="ml-auto size-2 rounded-full bg-green-500" />
            )}
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings className="size-5" />
            Settings
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 min-h-full transition-all duration-300 ml-0 md:ml-64"
      )}>
        {children}
      </main>

      {/* Chat Side Panel - Facebook Style */}
      {chatOpen && (
        <div
          className={cn(
            "fixed left-6 bottom-6 w-80 bg-white dark:bg-[#15202b] border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 z-40 rounded-2xl shadow-2xl",
            chatCollapsed ? "h-14" : "h-[450px]"
          )}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-[#192734] dark:to-[#15202b] rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <Users className="size-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-gray-900 dark:text-white">N8N Community</h2>
                {!chatCollapsed && (
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Active now</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setChatCollapsed(!chatCollapsed)}
                title={chatCollapsed ? "Expand" : "Collapse"}
              >
                {chatCollapsed ? (
                  <div className="size-4 rounded border-2 border-gray-400" />
                ) : (
                  <Minus className="size-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => { setChatOpen(false); setChatCollapsed(false); }}
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!chatCollapsed && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#15202b]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                    <MessageCircle className="size-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.authorId === user?.id;
                  return (
                    <div
                      key={message._id}
                      className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "")}
                    >
                      {!isOwn && (
                        <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                          {message.authorAvatar ? (
                            <Image src={message.authorAvatar} alt="" width={32} height={32} className="object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-white">
                              {message.authorName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                      <div className={cn("max-w-[80%]", isOwn ? "items-end" : "")}>
                        {!isOwn && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">
                              {escapeHtml(message.authorName)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatTimeAgo(message.createdAt)}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            "px-3 py-2 rounded-2xl text-sm shadow-sm",
                            isOwn
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-white dark:bg-[#192734] text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700"
                          )}
                        >
                          <p className="leading-relaxed">{escapeHtml(message.content)}</p>
                        </div>
                        {isOwn && (
                          <span className="text-[9px] text-gray-400 mt-1 block text-right">
                            {formatTimeAgo(message.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#192734] rounded-b-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-2.5 text-sm rounded-full bg-gray-100 dark:bg-[#253341] border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <Button
                size="sm"
                className="size-9 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all"
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
