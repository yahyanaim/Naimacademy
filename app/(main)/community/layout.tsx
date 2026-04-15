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
        "flex-1 min-h-full transition-all duration-300 ml-0 md:ml-64 pb-48"
      )}>
        {children}
      </main>

      {/* Chat Side Panel - Facebook Style */}
      {chatOpen && (
        <div
          className={cn(
            "fixed right-0 bottom-0 w-80 bg-card border border-t-2 border-l flex flex-col transition-all duration-300 z-40 rounded-tl-lg shadow-xl",
            chatCollapsed ? "h-12" : "h-[400px]"
          )}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Users className="size-4 text-white" />
              </div>
              {!chatCollapsed && (
                <div>
                  <h2 className="font-semibold text-sm">N8N Community Chat Group</h2>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500" />
                    Active now
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={() => setChatCollapsed(!chatCollapsed)}
                title={chatCollapsed ? "Expand" : "Collapse"}
              >
                {chatCollapsed ? (
                  <div className="size-3 border-2 border-muted-foreground rounded-sm" />
                ) : (
                  <Minus className="size-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={() => { setChatOpen(false); setChatCollapsed(false); }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!chatCollapsed && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {false ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="size-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No messages yet</p>
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
                        <div className="size-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {message.authorAvatar ? (
                            <Image src={message.authorAvatar} alt="" width={24} height={24} className="object-cover" />
                          ) : (
                            <span className="text-[8px] font-bold text-white">
                              {message.authorName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                      <div className={cn("max-w-[75%]", isOwn ? "items-end" : "")}>
                        {!isOwn && (
                          <span className="text-[10px] font-medium text-primary">
                            {escapeHtml(message.authorName)}
                          </span>
                        )}
                        <div
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-xs mt-0.5",
                            isOwn
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          )}
                        >
                          <p className="leading-relaxed">{escapeHtml(message.content)}</p>
                        </div>
                        <span className={cn(
                          "text-[9px] text-muted-foreground mt-0.5 block",
                          isOwn ? "text-right" : ""
                        )}>
                          {formatTimeAgo(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-3 py-2 text-xs border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button
                size="sm"
                className="size-8 p-0 rounded-full"
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
              >
                <Send className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
