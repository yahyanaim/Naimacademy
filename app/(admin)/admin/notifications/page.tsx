"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Users, Award, BookOpen, Info, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<string>("general");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        toast.success("Notification deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Error deleting notification");
    }
  }

  async function handleSend() {
    if (!title || !message) {
      toast.error("Title and message are required");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type }),
      });

      if (res.ok) {
        toast.success("Notification sent!");
        setTitle("");
        setMessage("");
        loadNotifications();
      } else {
        toast.error("Failed to send notification");
      }
    } catch {
      toast.error("Error sending notification");
    } finally {
      setSending(false);
    }
  }

  const typeIcons = {
    new_user: Users,
    course_completed: BookOpen,
    certificate: Award,
    general: Info,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Send notifications to students
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="size-4" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select value={type} onValueChange={(value) => setType(value || "general")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_user">New User</SelectItem>
                  <SelectItem value="course_completed">Course Completed</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification message"
                className="w-full min-h-[100px] p-3 border rounded-md"
              />
            </div>

            <Button onClick={handleSend} disabled={sending} className="w-full">
              {sending ? "Sending..." : "Send to All Students"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-4" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-muted-foreground text-sm">No notifications yet</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => {
                  const Icon = typeIcons[n.type as keyof typeof typeIcons] || Info;
                  return (
                    <div
                      key={n._id}
                      className={`p-3 rounded-lg border ${n.read ? "bg-muted/30" : "bg-muted/60"}`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="size-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{n.title}</p>
                            <div className="flex items-center gap-1">
                              {n.read && <CheckCircle className="size-3 text-green-500" />}
                              <button
                                onClick={() => deleteNotification(n._id)}
                                className="p-1 hover:bg-muted rounded text-destructive"
                                title="Delete"
                              >
                                <X className="size-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
