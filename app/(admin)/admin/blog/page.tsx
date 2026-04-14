"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  FileText,
  Search,
  Calendar,
  Clock,
  Bell,
  Image,
  Link as LinkIcon,
  TrendingUp,
  TrendingDown,
  Eye as EyeIcon,
  ThumbsUp,
  ThumbsDown,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  _id: string;
  title: string;
  titleStyle: "h1" | "h2" | "h3";
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  readingTime: number;
  views: number;
  upvotes: number;
  downvotes: number;
  publishedAt: string;
  createdAt: string;
}

interface BlogStats {
  total: number;
  published: number;
  drafts: number;
  totalViews: number;
  totalUpvotes: number;
  totalDownvotes: number;
  growth: number;
  postsLastWeek: number;
}

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    titleStyle: "h1" as "h1" | "h2" | "h3",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: "",
    author: "Naim Academy",
    isPublished: true,
  });
  const [initialFormData, setInitialFormData] = useState(formData);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  function hasUnsavedChanges() {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }

  function handleCloseDialog(open: boolean) {
    if (!open) {
      if (hasUnsavedChanges()) {
        if (confirm("You have unsaved changes. Are you sure you want to close? Your changes will be lost.")) {
          setIsDialogOpen(false);
        }
      } else {
        setIsDialogOpen(false);
      }
    } else {
      setIsDialogOpen(true);
    }
  }

  async function loadStats() {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await res.json();
      setStats(data.blog as BlogStats);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }

  async function loadPosts() {
    try {
      const res = await fetch("/api/admin/blog");
      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
    loadStats();
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  function openCreateDialog() {
    setEditingPost(null);
    const newForm = {
      title: "",
      titleStyle: "h1" as "h1" | "h2" | "h3",
      excerpt: "",
      content: "",
      coverImage: "",
      tags: "",
      author: "Naim Academy",
      isPublished: true,
    };
    setFormData(newForm);
    setInitialFormData(newForm);
    setIsDialogOpen(true);
  }

  function openEditDialog(post: BlogPost) {
    setEditingPost(post);
    const newForm = {
      title: post.title,
      titleStyle: post.titleStyle || "h1",
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || "",
      tags: post.tags.join(", "),
      author: post.author,
      isPublished: post.isPublished,
    };
    setFormData(newForm);
    setInitialFormData(newForm);
    setIsDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.title || !formData.excerpt || !formData.content) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      if (editingPost) {
        const res = await fetch("/api/admin/blog", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPost._id, ...payload }),
        });
        if (res.ok) {
          await loadPosts();
          setIsDialogOpen(false);
        }
      } else {
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          await loadPosts();
          setIsDialogOpen(false);
          
          if (formData.isPublished && data.slug) {
            await sendNewArticleNotification(formData.title, `/blog/${data.slug}`);
          }
        }
      }
    } finally {
      setSaving(false);
    }
  }

  function insertHeading(prefix: string) {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const text = textarea.value;
    const before = text.substring(0, start);
    const lineStart = before.lastIndexOf("\n") + 1;
    
    const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    const cursorPos = start + prefix.length;
    
    setFormData({ ...formData, content: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }

  function insertFormat(before: string, after: string) {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + (selected || "text") + after + text.substring(end);
    
    setFormData({ ...formData, content: newText });
    
    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length + 4);
      }
    }, 0);
  }

  function insertCode() {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    const codeText = selected || "code";
    const newText = text.substring(0, start) + "`" + codeText + "`" + text.substring(end);
    setFormData({ ...formData, content: newText });
  }

  function insertLink() {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const linkText = selected || prompt("Enter link text:") || "Click here";
    const url = prompt("Enter URL:", "https://");
    
    if (url && linkText) {
      const linkMarkdown = `[${linkText}](${url})`;
      const newText = text.substring(0, start) + linkMarkdown + text.substring(end);
      setFormData({ ...formData, content: newText });
    }
  }

  const specialChars = [
    { label: "Red Dot", char: "\u25CF", color: "text-red-500" },
    { label: "Green Dot", char: "\u25CF", color: "text-green-500" },
    { label: "Blue Dot", char: "\u25CF", color: "text-blue-500" },
    { label: "Yellow Dot", char: "\u25CF", color: "text-yellow-500" },
    { label: "Purple Dot", char: "\u25CF", color: "text-purple-500" },
    { label: "Check Mark", char: "\u2713", color: "text-green-500" },
    { label: "Cross Mark", char: "\u2717", color: "text-red-500" },
    { label: "Star", char: "\u2605", color: "text-yellow-500" },
    { label: "Heart", char: "\u2665", color: "text-red-400" },
    { label: "Arrow Right", char: "\u2192", color: "" },
    { label: "Bullet Point", char: "\u2022", color: "" },
    { label: "Warning", char: "\u26A0", color: "text-amber-500" },
    { label: "Info", char: "\u2139", color: "text-blue-500" },
    { label: "Check Box", char: "\u2610", color: "" },
    { label: "Sun", char: "\u2600", color: "text-yellow-500" },
    { label: "Music", char: "\u266B", color: "text-pink-500" },
  ];

  function insertSpecialChar(char: string) {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const text = textarea.value;
    const newText = text.substring(0, start) + char + text.substring(start);
    setFormData({ ...formData, content: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const res = await fetch("/api/upload", { 
        method: "POST", 
        body: uploadFormData
      });
      const data = await res.json();

      if (res.ok && data.url) {
        const textarea = document.getElementById("content") as HTMLTextAreaElement;
        const cursorPos = textarea?.selectionStart || 0;
        const currentContent = formData.content;
        const imageMarkdown = `\n![${file.name}](${data.url})\n`;
        const newContent = currentContent.slice(0, cursorPos) + imageMarkdown + currentContent.slice(cursorPos);
        setFormData({ ...formData, content: newContent });
        toast.success("Image uploaded!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    }

    e.target.value = "";
  }

  async function sendNewArticleNotification(articleTitle: string, articleUrl: string) {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Article Published!",
          message: `Check out our latest article: "${articleTitle}"`,
          type: "new_article",
          userIds: [],
          url: articleUrl,
        }),
      });
      
      if (res.ok) {
        toast.success("Notification sent to all students!");
      } else {
        toast.error("Failed to send notification");
      }
    } catch {
      toast.error("Failed to send notification");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete post");
      }
      await loadPosts();
      toast.success("Post deleted successfully");
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error("Failed to delete post");
    }
  }

  async function handleTogglePublish(post: BlogPost) {
    const newStatus = !post.isPublished;
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post._id, isPublished: newStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to update publish status");
      }
      await loadPosts();
      
      if (newStatus) {
        await sendNewArticleNotification(post.title, `/blog/${post.slug}`);
      }
      toast.success(newStatus ? "Post published" : "Post unpublished");
    } catch (err) {
      console.error("Error toggling publish status:", err);
      toast.error("Failed to update publish status");
    }
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground text-sm">Create and manage your blog articles</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreateDialog}>
            <Plus className="size-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Articles</CardTitle>
                <FileText className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stats.growth > 0 ? (
                    <TrendingUp className="size-4 text-green-500" />
                  ) : stats.growth < 0 ? (
                    <TrendingDown className="size-4 text-red-500" />
                  ) : null}
                  <span className={`text-xs ${stats.growth > 0 ? "text-green-500" : stats.growth < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {stats.growth > 0 ? "+" : ""}{stats.growth}% this week
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.published} published, {stats.drafts} drafts
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                <EyeIcon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all articles</p>
                <p className="text-xs text-muted-foreground/70 mt-2 italic">
                  Average {Math.round(stats.totalViews / stats.total)} views per article
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upvotes</CardTitle>
                <ThumbsUp className="size-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalUpvotes}</div>
                <p className="text-xs text-green-500 mt-1">
                  {Math.round((stats.totalUpvotes / (stats.totalUpvotes + stats.totalDownvotes || 1)) * 100)}% approval
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2 italic">
                  Students found these helpful
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Downvotes</CardTitle>
                <ThumbsDown className="size-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.totalDownvotes}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalDownvotes} negative feedback
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2 italic">
                  Use feedback to improve
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">Blog Performance Overview</h3>
            <p className="text-sm text-muted-foreground">
              Your blog has <span className="font-medium text-foreground">{stats.total}</span> articles generating{" "}
              <span className="font-medium text-foreground">{stats.totalViews.toLocaleString()}</span> total views.{" "}
              {stats.published} articles are published and attracting an average of{" "}
              <span className="font-medium text-foreground">{Math.round(stats.totalViews / stats.total)}</span> views per article.{" "}
              The upvote ratio of{" "}
              <span className="font-medium text-green-600">{Math.round((stats.totalUpvotes / (stats.totalUpvotes + stats.totalDownvotes || 1)) * 100)}%</span>{" "}
              indicates strong content quality. {stats.postsLastWeek > 0 ? (
                <>
                  You published <span className="font-medium text-foreground">{stats.postsLastWeek}</span> article{stats.postsLastWeek > 1 ? "s" : ""} this week.
                </>
              ) : "No new articles published this week."}
            </p>
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No articles found</p>
            </div>
          ) : (
            <>
              <div className="max-h-[400px] overflow-y-auto pr-2">
                <div className="space-y-3">
                  {paginatedPosts.map((post) => (
                    <div
                      key={post._id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{post.title}</h3>
                          {!post.isPublished && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Clock className="size-3 flex-shrink-0" />
                            <span>{post.readingTime} min read</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="size-3" />
                            {post.views} views
                          </span>
                          {(post.upvotes > 0 || post.downvotes > 0) && (
                            <span className="flex items-center gap-1">
                              <span className="text-green-600">+{post.upvotes}</span>
                              <span className="text-red-600">-{post.downvotes}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(post)}>
                            <Edit className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePublish(post)}>
                            <Eye className="size-4 mr-2" />
                            {post.isPublished ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(post._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPosts.length)} of {filteredPosts.length} articles
                  </p>
                  <div className="flex items-center gap-2">
                    <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 / page</SelectItem>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="20">20 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="size-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-lg">
              {editingPost ? "Edit Article" : "Create New Article"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter article title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="titleStyle" className="text-sm font-medium">Title Heading Style</Label>
              <Select
                value={formData.titleStyle}
                onValueChange={(v) =>
                  setFormData({ ...formData, titleStyle: v as "h1" | "h2" | "h3" })
                }
              >
                <SelectTrigger id="titleStyle" className="mt-1">
                  <SelectValue placeholder="Select heading style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1 - Largest heading</SelectItem>
                  <SelectItem value="h2">H2 - Medium heading</SelectItem>
                  <SelectItem value="h3">H3 - Smaller heading</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="author" className="text-sm font-medium">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Author name"
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Brief description of the article"
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="content" className="text-sm font-medium">Content</Label>
                <div className="flex gap-1 flex-wrap justify-end">
                  <button type="button" onClick={() => insertHeading("# ")} className="px-2 py-1 text-xs font-medium border rounded hover:bg-muted">H1</button>
                  <button type="button" onClick={() => insertHeading("## ")} className="px-2 py-1 text-xs font-medium border rounded hover:bg-muted">H2</button>
                  <button type="button" onClick={() => insertHeading("### ")} className="px-2 py-1 text-xs font-medium border rounded hover:bg-muted">H3</button>
                  <button type="button" onClick={() => insertHeading("#### ")} className="px-2 py-1 text-xs font-medium border rounded hover:bg-muted">H4</button>
                  <button type="button" onClick={() => insertHeading("##### ")} className="px-2 py-1 text-xs font-medium border rounded hover:bg-muted">H5</button>
                  <button type="button" onClick={() => insertHeading("###### ")} className="px-2 py-1 text-xs font-medium border rounded hover:bg-muted">H6</button>
                  <button type="button" onClick={(e) => { e.preventDefault(); insertFormat("**", "**"); }} className="px-2 py-1 text-xs font-bold border rounded hover:bg-muted" title="Bold">B</button>
                  <button type="button" onClick={(e) => { e.preventDefault(); insertFormat("*", "*"); }} className="px-2 py-1 text-xs italic border rounded hover:bg-muted" title="Italic">I</button>
                  <button type="button" onClick={(e) => { e.preventDefault(); insertLink(); }} className="px-2 py-1 text-xs border rounded hover:bg-muted" title="Insert Link">
                    <LinkIcon className="size-3" />
                  </button>
                  <button type="button" onClick={(e) => { e.preventDefault(); insertCode(); }} className="px-2 py-1 text-xs font-mono border rounded hover:bg-muted" title="Insert Code">
                    {"</>"}
                  </button>
                  <div className="relative group">
                    <button type="button" className="px-2 py-1 text-xs border rounded hover:bg-muted" title="Special Characters">
                      <Star className="size-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg p-2 z-50 hidden group-hover:block w-48">
                      <p className="text-xs text-muted-foreground mb-2 px-2">Click to insert:</p>
                      <div className="grid grid-cols-4 gap-1">
                        {specialChars.map((item, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => insertSpecialChar(item.char)}
                            className={`px-2 py-1 text-lg hover:bg-muted rounded text-center ${item.color}`}
                            title={item.label}
                          >
                            {item.char}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write your article content here... (Markdown is supported)"
                rows={20}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Click heading buttons to insert at cursor position
              </p>
              <div className="mt-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-muted cursor-pointer">
                  <Image className="size-4" />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="coverImage" className="text-sm font-medium">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="learning, tips, tutorial"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingPost ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
