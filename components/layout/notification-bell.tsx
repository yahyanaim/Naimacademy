"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, X } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
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
        onClick={() => setOpen(!open)}
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
        <div className="fixed inset-0 bg-black/50 z-50 md:absolute md:inset-auto md:right-0 md:mt-2 md:w-80 md:bg-background md:border md:rounded-lg md:shadow-lg">
          <div className="h-full md:h-auto flex flex-col bg-background md:border md:rounded-lg overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-background">
              <h3 className="font-semibold">Notifications</h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded md:hidden">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 border-b last:border-0 ${!n.read ? "bg-muted/50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm line-clamp-1 flex-1">{n.title}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="p-1 hover:bg-muted rounded"
                            title="Mark as read"
                          >
                            <Check className="size-3" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n._id)}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500"
                          title="Delete"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
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