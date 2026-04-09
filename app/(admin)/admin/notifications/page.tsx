"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Send, Users, Award, BookOpen, Info, CheckCircle, X, User, Search, Filter, FileText } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  progress?: {
    completionPercentage?: number;
  };
  examAttempts?: {
    score: number;
    passed: boolean;
  }[];
  certifications?: unknown[];
  createdAt?: string;
}

interface StudentRecord extends UserRecord {
  hasCertificate: boolean;
  hasPassed: boolean;
  hasCompleted: boolean;
  isNew: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allStudents, setAllStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<string>("general");
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    loadNotifications();
    loadStudents();
  }, []);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/admin/notifications", { credentials: "include" });
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

  async function loadStudents() {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const students = data
          .filter((u: UserRecord) => u.role === "student")
          .map((u: UserRecord): StudentRecord => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return {
              ...u,
              hasCertificate: (u.certifications?.length ?? 0) > 0,
              hasPassed: u.examAttempts?.some((a) => a.passed) ?? false,
              hasCompleted: (u.progress?.completionPercentage ?? 0) >= 100,
              isNew: u.createdAt ? new Date(u.createdAt) >= sevenDaysAgo : false,
            };
          });
        setAllStudents(students);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleTypeChange(value: string | null) {
    if (!value) return;
    setType(value);
    
    let filtered: StudentRecord[] = allStudents;
    let autoSelected: string[] = [];
    
    switch (value) {
      case "certificate":
        filtered = allStudents.filter(s => s.hasCertificate);
        autoSelected = allStudents.filter(s => s.hasCertificate).map(s => s._id);
        break;
      case "course_completed":
        filtered = allStudents.filter(s => s.hasCompleted);
        autoSelected = allStudents.filter(s => s.hasCompleted).map(s => s._id);
        break;
      case "new_user":
        filtered = allStudents.filter(s => s.isNew);
        autoSelected = allStudents.filter(s => s.isNew).map(s => s._id);
        break;
      case "new_article":
        filtered = allStudents;
        autoSelected = allStudents.map(s => s._id);
        break;
      default:
        filtered = allStudents;
        autoSelected = [];
    }
    
    if (value !== "general" && filtered.length > 0) {
      setSendToAll(false);
      setSelectedStudents(autoSelected);
    } else {
      setSendToAll(true);
      setSelectedStudents([]);
    }
  }

  async function handleDelete(notificationId: string) {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notificationId }),
      });
      if (res.ok) {
        toast.success("Notification deleted");
        loadNotifications();
      } else {
        toast.error("Failed to delete notification");
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

    if (!sendToAll && selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setSending(true);
    try {
      const payload: Record<string, unknown> = { 
        title, 
        message, 
        type 
      };
      
      if (sendToAll) {
        payload.userIds = [];
      } else {
        payload.userIds = selectedStudents;
      }

      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Notification sent to ${data.count} student${data.count !== 1 ? "s" : ""}!`);
        setTitle("");
        setMessage("");
        setSelectedStudents([]);
        setSendToAll(true);
        loadNotifications();
      } else {
        toast.error(data.error || "Failed to send notification");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function toggleStudent(studentId: string) {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  }

  function toggleAll() {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s._id));
    }
  }

  function getStudentsByType(typeFilter: string): StudentRecord[] {
    switch (typeFilter) {
      case "certificate":
        return allStudents.filter(s => s.hasCertificate);
      case "course_completed":
        return allStudents.filter(s => s.hasCompleted);
      case "new_user":
        return allStudents.filter(s => s.isNew);
      case "new_article":
        return allStudents;
      default:
        return allStudents;
    }
  }

  function getStudentCountByType(typeFilter: string): number {
    return getStudentsByType(typeFilter).length;
  }

  const filteredStudents = getStudentsByType(type).filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const typeIcons = {
    new_user: Users,
    course_completed: BookOpen,
    certificate: Award,
    new_article: FileText,
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
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center justify-between w-full">
                      <span>General</span>
                      <span className="text-xs text-muted-foreground ml-2">({allStudents.length})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="new_user">
                    <div className="flex items-center justify-between w-full">
                      <span>New Users (0-7 days)</span>
                      <span className="text-xs text-muted-foreground ml-2">({getStudentCountByType("new_user")})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="course_completed">
                    <div className="flex items-center justify-between w-full">
                      <span>Course Completed (100%)</span>
                      <span className="text-xs text-muted-foreground ml-2">({getStudentCountByType("course_completed")})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="certificate">
                    <div className="flex items-center justify-between w-full">
                      <span>Has Certificate</span>
                      <span className="text-xs text-muted-foreground ml-2">({getStudentCountByType("certificate")})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="new_article">
                    <div className="flex items-center justify-between w-full">
                      <span>New Article Published</span>
                      <span className="text-xs text-muted-foreground ml-2">({allStudents.length})</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {type === "general" 
                  ? "Select a type to auto-filter students" 
                  : `Auto-selected ${getStudentsByType(type).length} ${type === "certificate" ? "certified" : type === "course_completed" ? "completed" : "new"} students`}
              </p>
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

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendAll"
                  checked={sendToAll}
                  onCheckedChange={(checked) => {
                    setSendToAll(checked === true);
                    if (checked) setSelectedStudents([]);
                  }}
                />
                <Label htmlFor="sendAll" className="font-normal cursor-pointer">
                  Send to all students ({allStudents.length})
                </Label>
              </div>

              {!sendToAll && (
                <div className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {type === "certificate" && "Students with certificates"}
                      {type === "course_completed" && "Students who completed the course"}
                      {type === "new_user" && "New users (last 7 days)"}
                      {type === "new_article" && "All students (new article)"}
                      {type === "general" && "All students"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({getStudentsByType(type).length})
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>

                  <div className="flex items-center space-x-2 border-b pb-2">
                    <Checkbox
                      id="selectAll"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onCheckedChange={() => toggleAll()}
                    />
                    <Label htmlFor="selectAll" className="font-normal text-sm cursor-pointer">
                      Select all ({filteredStudents.length})
                    </Label>
                  </div>

                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {filteredStudents.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No students match this filter
                        </p>
                      ) : (
                        filteredStudents.map((student) => (
                          <div key={student._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`student-${student._id}`}
                              checked={selectedStudents.includes(student._id)}
                              onCheckedChange={() => toggleStudent(student._id)}
                            />
                            <Label 
                              htmlFor={`student-${student._id}`} 
                              className="font-normal cursor-pointer flex-1 text-sm"
                            >
                              <span className="font-medium">{student.name}</span>
                              <span className="text-muted-foreground ml-2">{student.email}</span>
                              <div className="flex gap-1 mt-0.5">
                                {student.hasCertificate && (
                                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                    Certified
                                  </span>
                                )}
                                {student.hasCompleted && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                    Completed
                                  </span>
                                )}
                              </div>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  <p className="text-xs text-muted-foreground">
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
              )}
            </div>

            <Button onClick={handleSend} disabled={sending} className="w-full">
              {sending ? "Sending..." : sendToAll ? "Send to All Students" : `Send to ${selectedStudents.length} Student${selectedStudents.length !== 1 ? "s" : ""}`}
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
          <CardContent className="max-h-[500px] overflow-y-auto">
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
                        <Icon className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{n.title}</p>
                            <div className="flex items-center gap-2">
                              {n.read && <CheckCircle className="size-3 text-green-500" />}
                              <button
                                onClick={() => handleDelete(n._id)}
                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500"
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
