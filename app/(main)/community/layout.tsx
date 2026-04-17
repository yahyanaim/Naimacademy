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
  Minus,
  MoreHorizontal,
  Search,
  Bell,
  Loader,
  Video,
  Phone,
  Copy,
  ExternalLink
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

const baseNavItems = [
  { label: "Questions", href: "/community", icon: MessageCircle },
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
  const [chatOpen, setChatOpen] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [hasNewQuestions, setHasNewQuestions] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [liveSession, setLiveSession] = useState<{active: boolean; hostId: string; hostName: string} | null>(null);
  const [liveChat, setLiveChat] = useState<{messages: ChatMessage[]; newMessage: string; sending: boolean}>({
    messages: [],
    newMessage: "",
    sending: false
  });
  const [inviteLink, setInviteLink] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedChat = useRef(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        // Fetch saved posts count
        const savedRes = await fetch("/api/community?type=saved");
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedCount(savedData.posts?.length || 0);
        }
        
        // Fetch user's posts count only
        const myPostsRes = await fetch("/api/community?type=my-posts");
        if (myPostsRes.ok) {
          const myPostsData = await myPostsRes.json();
          setQuestionsCount(myPostsData.count || 0);
        }
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

  // Check if user has posted today - show dot if they have
  useEffect(() => {
    const today = new Date().toDateString();
    const lastPostDate = localStorage.getItem("lastPostDate");
    const hasPostedToday = lastPostDate === today;
    setHasNewQuestions(hasPostedToday);
  }, [questionsCount]);

  // Fetch notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const lastViewed = localStorage.getItem("lastViewedCommunity");
        const res = await fetch(`/api/community?type=notifications&lastViewed=${lastViewed || ""}`);
        if (res.ok) {
          const data = await res.json();
          setNotificationCount(data.count || 0);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update last viewed when leaving community
  useEffect(() => {
    return () => {
      localStorage.setItem("lastViewedCommunity", new Date().toISOString());
    };
  }, [pathname]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const fetchLiveSession = useCallback(async () => {
    try {
      const res = await fetch("/api/community?type=live");
      if (res.ok) {
        const data = await res.json();
        setLiveSession(data.session || null);
        if (data.session) {
          setLiveChat(prev => ({ ...prev, messages: data.messages || [] }));
        }
      }
    } catch (e) { console.error(e); }
  }, []);

  const startLiveSession = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "startLive" }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiveSession({ active: true, hostId: user.id, hostName: user.name });
        setInviteLink(data.inviteLink || `${window.location.origin}/community?live=true&session=${data.sessionId}`);
      }
    } catch {}
  };

  const endLiveSession = async () => {
    try {
      await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "endLive" }),
      });
      setLiveSession(null);
      setLiveChat(prev => ({ ...prev, messages: [] }));
      setInviteLink("");
    } catch {}
  };

  const sendLiveMessage = async () => {
    if (!liveChat.newMessage.trim() || !user) return;
    setLiveChat(prev => ({ ...prev, sending: true }));
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "liveChat",
          content: liveChat.newMessage,
          authorName: user.name,
          authorEmail: user.email,
          authorAvatar: user.avatar,
        }),
      });
      if (res.ok) {
        setLiveChat(prev => ({ ...prev, newMessage: "" }));
        fetchLiveSession();
      }
    } catch {
      console.error("Failed to send live message");
    } finally {
      setLiveChat(prev => ({ ...prev, sending: false }));
    }
  };

  const generateInviteLink = async () => {
    const link = `${window.location.origin}/community?live=true&session=${Date.now()}`;
    setInviteLink(link);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    if (showLive) {
      fetchLiveSession();
      const interval = setInterval(fetchLiveSession, 5000);
      return () => clearInterval(interval);
    }
  }, [showLive, fetchLiveSession]);

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
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Left Sidebar - Twitter Style */}
      <aside className="w-72 fixed left-0 top-14 bottom-0 z-30 hidden md:flex flex-col bg-background border-r">
        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                const url = new URL(window.location.href);
                if (value) {
                  url.searchParams.set("q", value);
                } else {
                  url.searchParams.delete("q");
                }
                router.push(url.pathname + url.search);
              }}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm focus:outline-none transition-all border border-transparent focus:border-blue-400"
            />
          </div>
        </div>

        {/* User Profile Card */}
        <div className="px-4">
          <Link href={`/community/profile/${user?.id}`} className="block bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <Image src={user.avatar} alt="" width={48} height={48} className="object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">@{user.name?.toLowerCase().replace(/\s+/g, "")}</p>
              </div>
              <div className="relative group">
                <button 
                  onClick={(e) => e.preventDefault()}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreHorizontal className="size-5 text-gray-500" />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all mt-1 z-50">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings className="size-4" />
                    Settings
                  </Link>
                  <button 
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      router.push("/");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <Link href="/community/saved" className="hover:underline">
                <span className="font-bold">{savedCount}</span>
                <span className="text-gray-500 ml-1">Saved</span>
              </Link>
              <span>
                <span className="font-bold">{questionsCount}</span>
                <span className="text-gray-500 ml-1">Questions</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 mt-2">
          <div className="space-y-1">
            {baseNavItems.map((item) => {
              const isActive = pathname === item.href;
              const showDot = item.href === "/community" && hasNewQuestions;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-full text-[15px] font-medium transition-colors",
                    isActive
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="size-6" />
                  <span>{item.label}</span>
                  {showDot && (
                    <span className="ml-auto size-2 rounded-full bg-green-500" />
                  )}
                </Link>
              );
            })}
            
            {/* Profile Link */}
            <Link
              href={user ? `/community/profile/${user.id}` : "/community"}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-full text-[15px] font-medium transition-colors",
                pathname?.startsWith("/community/profile")
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Users className="size-6" />
              <span>Profile</span>
            </Link>

            {/* Live Session Button */}
            <button
              onClick={() => setShowLive(!showLive)}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-full text-[15px] font-medium transition-colors w-full",
                showLive
                  ? "bg-red-500 text-white"
                  : "text-red-600 hover:bg-red-50"
              )}
            >
              <Video className="size-6" />
              <span>{showLive ? "End Live" : "Go Live"}</span>
              {liveSession?.active && !showLive && (
                <span className="ml-auto size-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-full text-[15px] font-medium transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="relative">
                  <Bell className="size-6" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </div>
                <span>Notifications</span>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-background border border-border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                  <div className="p-3 border-b border-border">
                    <h3 className="font-semibold text-sm">New Questions</h3>
                    <p className="text-xs text-muted-foreground">
                      {notificationCount > 0 ? `${notificationCount} new question${notificationCount > 1 ? "s" : ""} since your last visit` : "No new questions"}
                    </p>
                  </div>
                  {notificationCount > 0 && (
                    <div className="p-2">
                      <button
                        onClick={() => {
                          localStorage.setItem("lastViewedCommunity", new Date().toISOString());
                          setNotificationCount(0);
                          setShowNotifications(false);
                          router.push("/community");
                        }}
                        className="w-full text-center py-2 px-3 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                      >
                        View New Questions
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Toggle Button */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-full text-[15px] font-medium transition-colors",
                chatOpen
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <MessageCircle className="size-6" />
              <span>Chat</span>
              {!chatOpen && (
                <span className="ml-auto size-2 rounded-full bg-green-500" />
              )}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 min-h-full transition-all duration-300 ml-0 md:ml-72 pt-14 md:pt-0"
      )}>
        {children}
      </main>

      {/* Chat Side Panel - Facebook Style */}
      {chatOpen && (
        <div
          className={cn(
            "fixed right-2 bottom-0 w-80 bg-white dark:bg-[#15202b] border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 z-40 rounded-l-2xl shadow-2xl",
            chatCollapsed ? "h-14" : "h-[450px]"
          )}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-[#15202b] rounded-t-2xl flex-shrink-0">
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

      {/* Live Session Panel */}
      {showLive && liveSession && (
        <div
          className={cn(
            "fixed right-2 top-14 w-96 bg-white dark:bg-[#15202b] border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 z-40 rounded-xl shadow-2xl mx-2 mt-2",
            "h-[calc(100vh-5rem)]"
          )}
        >
          {/* Live Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-[#15202b] rounded-t-xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-red-500 flex items-center justify-center shadow-md animate-pulse">
                <Video className="size-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                  Live Session
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Hosted by {liveSession.hostName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:bg-red-50"
              onClick={generateInviteLink}
            >
              <ExternalLink className="size-4" />
            </Button>
          </div>

          {/* Invite Link Section */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <p className="text-xs text-muted-foreground mb-2">Invite others:</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink || `${window.location.origin}/community?live=true`}
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-gray-900 border rounded-lg text-gray-600 dark:text-gray-300"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={generateInviteLink}
                className="text-xs"
              >
                <Copy className="size-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          {/* Video Placeholder */}
          <div className="flex-1 bg-gray-900 dark:bg-black flex items-center justify-center min-h-[200px]">
            <div className="text-center text-white">
              <Video className="size-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-70">Live Video Stream</p>
              <p className="text-xs opacity-50">Waiting for stream...</p>
            </div>
          </div>

          {/* Live Chat */}
          <div className="flex-1 flex flex-col border-t border-gray-100 dark:border-gray-800 min-h-[150px]">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <Users className="size-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Live Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {liveChat.messages.slice(-10).map((msg: any) => (
                <div key={msg._id} className="flex items-start gap-2">
                  <div className="size-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                    {msg.authorAvatar ? (
                      <Image src={msg.authorAvatar} alt="" width={24} height={24} className="object-cover rounded-full" />
                    ) : (
                      <span className="text-[10px] font-bold text-white">{msg.authorName?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{msg.authorName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 p-3 border-t border-gray-100 dark:border-gray-800">
              <input
                type="text"
                placeholder="Send a message..."
                value={liveChat.newMessage}
                onChange={(e) => setLiveChat(prev => ({ ...prev, newMessage: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && sendLiveMessage()}
                className="flex-1 px-4 py-2.5 text-sm rounded-full bg-gray-100 dark:bg-[#253341] border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <Button
                size="sm"
                className="size-9 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all"
                onClick={sendLiveMessage}
                disabled={liveChat.sending || !liveChat.newMessage.trim()}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>

          {/* End Live Button */}
          {liveSession.hostId === user?.id && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                onClick={endLiveSession}
              >
                <Phone className="size-4 mr-2" />
                End Live Session
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Floating Chat Button - Mobile Only */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={cn(
          "md:hidden fixed bottom-4 right-4 z-50 size-12 rounded-full flex items-center justify-center shadow-lg transition-all",
          chatOpen
            ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            : "bg-blue-500 text-white hover:bg-blue-600"
        )}
      >
        <MessageCircle className="size-6" />
        {!chatOpen && (
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
        )}
      </button>
    </div>
  );
}
