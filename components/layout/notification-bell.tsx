"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import { toast } from "sonner";

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
      toast.error("Failed to mark as read");
    }
  }

  async function deleteNotification(notificationId: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        toast.success("Notification deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-9 h-9 hover:bg-muted rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div className={`
        absolute right-0 mt-2 bg-background border rounded-lg shadow-lg z-50
        w-[calc(100vw-2rem)] max-w-sm md:w-80
        ${open ? "animate-in fade-in slide-in-from-top-2" : ""}
      `}>
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <button onClick={() => setOpen(false)} className="md:hidden p-1 hover:bg-muted rounded">
            <X className="size-4" />
          </button>
        </div>
        
        <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <div
                key={n._id}
                className={`p-3 border-b last:border-0 hover:bg-muted/30 transition-colors ${!n.read ? "bg-muted/50" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm line-clamp-1">{n.title}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="p-1.5 hover:bg-muted rounded"
                        title="Mark as read"
                      >
                        <Check className="size-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteNotification(n._id, e)}
                      className="p-1.5 hover:bg-muted rounded text-destructive"
                      title="Delete"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {n.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}