"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import Link from "next/link";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
    load();
  }, []);

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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="size-6" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-muted-foreground">No notifications</p>
      ) : (
        <div className="divide-y border rounded-lg">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 ${!n.read ? "bg-muted/50" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="shrink-0 p-2 hover:bg-muted rounded"
                    title="Mark as read"
                  >
                    <Check className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}