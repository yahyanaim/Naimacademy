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
  const [saving, setSaving] = useState(false);

  async function loadPosts() {
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  function openCreateDialog() {
    setEditingPost(null);
    setFormData({
      title: "",
      titleStyle: "h1",
      excerpt: "",
      content: "",
      coverImage: "",
      tags: "",
      author: "Naim Academy",
      isPublished: true,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(post: BlogPost) {
    setEditingPost(post);
    setFormData({
      title: post.title,
      titleStyle: post.titleStyle || "h1",
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || "",
      tags: post.tags.join(", "),
      author: post.author,
      isPublished: post.isPublished,
    });
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
          await loadPosts();
          setIsDialogOpen(false);
          
          if (formData.isPublished) {
            await sendNewArticleNotification(formData.title);
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

  async function sendNewArticleNotification(articleTitle: string) {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Article Published!",
          message: `Check out our latest article: "${articleTitle}"`,
          type: "new_article",
          userIds: [],
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
      await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      await loadPosts();
    } catch {
      // ignore
    }
  }

  async function handleTogglePublish(post: BlogPost) {
    const newStatus = !post.isPublished;
    try {
      await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post._id, isPublished: newStatus }),
      });
      await loadPosts();
      
      if (newStatus) {
        await sendNewArticleNotification(post.title);
      }
    } catch {
      // ignore
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
            <div className="space-y-4">
              {filteredPosts.map((post) => (
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Article" : "Create New Article"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter article title"
              />
            </div>
            <div>
              <Label htmlFor="titleStyle">Title Heading Style</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Choose how the title appears on the article page. H1 is largest, H3 is smallest.
              </p>
              <Select
                value={formData.titleStyle}
                onValueChange={(v) =>
                  setFormData({ ...formData, titleStyle: v as "h1" | "h2" | "h3" })
                }
              >
                <SelectTrigger id="titleStyle">
                  <SelectValue placeholder="Select heading style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">H1</span>
                      <span className="text-muted-foreground text-xs">- Largest heading</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="h2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">H2</span>
                      <span className="text-muted-foreground text-xs">- Medium heading</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="h3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">H3</span>
                      <span className="text-muted-foreground text-xs">- Smallest heading</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Author name"
              />
            </div>
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Brief description of the article"
                rows={2}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content">Content (Markdown supported)</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => insertHeading("# ")}
                    className="px-3 py-1 text-xs font-bold border rounded hover:bg-muted"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertHeading("## ")}
                    className="px-3 py-1 text-xs font-bold border rounded hover:bg-muted"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertHeading("### ")}
                    className="px-3 py-1 text-xs font-bold border rounded hover:bg-muted"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertHeading("**")}
                    className="px-3 py-1 text-xs font-bold border rounded hover:bg-muted"
                    title="Bold"
                  >
                    B
                  </button>
                </div>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write your article content here... (Markdown is supported)"
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use the buttons above to insert headings, or type manually: # Heading 1, ## Heading 2, ### Heading 3
              </p>
            </div>
            <div>
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="learning, tips, tutorial"
              />
            </div>
          </div>
          <DialogFooter>
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
