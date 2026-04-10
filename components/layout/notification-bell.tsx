"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, X, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  type?: string;
  url?: string;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch {
      // ignore
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch {
      // ignore
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="relative p-2 hover:bg-muted rounded-full transition-colors"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] md:absolute md:inset-auto md:right-0 md:mt-2 md:w-80 md:bg-background md:border md:rounded-lg md:shadow-lg"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="h-full md:h-auto flex flex-col bg-background md:border md:rounded-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-muted rounded-md md:hidden">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 border-b last:border-0 ${!n.read ? "bg-muted/50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{n.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {n.message}
                        </p>
                        {n.url && (
                          <Link 
                            href={n.url}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                            onClick={() => { markAsRead(n._id); setOpen(false); }}
                          >
                            {n.type === "new_article" && <FileText className="size-3" />}
                            Read article
                            <ExternalLink className="size-3" />
                          </Link>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="p-1.5 hover:bg-muted rounded-md"
                            title="Mark as read"
                          >
                            <Check className="size-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n._id)}
                          className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-red-500"
                          title="Delete"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}