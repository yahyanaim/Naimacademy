"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Pin, 
  Heart, 
  Clock, 
  MessageCircle, 
  Loader2, 
  Send, 
  Plus, 
  X, 
  Share2,
  Flag,
  Trash2,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Post {
  _id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  likes: string[];
  saved: string[];
  comments: Comment[];
  createdAt: string;
  expiresAt: string;
}

interface Comment {
  _id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

function getHoursUntilExpiry(expiresAt: string): number {
  const expires = new Date(expiresAt);
  const now = new Date();
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60)));
}

const SUGGESTED_TAGS = [
  "javascript", "python", "react", "nodejs", "css", "html",
  "api", "database", "mongodb", "nextjs", "typescript", "git"
];

export default function CommunityHomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <CommunityHomePageContent />
    </Suspense>
  );
}

function CommunityHomePageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "unanswered">("newest");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/community?type=posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      toast.error("Failed to load posts");
    }
  };

  useEffect(() => {
    const init = async () => {
      const [userRes, postsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/community?type=posts")
      ]);
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !newTags.includes(normalizedTag) && newTags.length < 5) {
      setNewTags([...newTags, normalizedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewTags(newTags.filter(t => t !== tag));
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || newPost.trim().length < 10) {
      toast.error("Post must be at least 10 characters");
      return;
    }

    if (newTags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }

    setPosting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "post",
          content: newPost,
          tags: newTags,
          authorName: user?.name,
          authorEmail: user?.email,
          authorAvatar: user?.avatar,
        }),
      });

      if (res.ok) {
        toast.success("Question posted!");
        setNewPost("");
        setNewTags([]);
        setShowNewPostForm(false);
        fetchPosts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to post");
      }
    } catch {
      toast.error("Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(`/api/community/post/${postId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Question deleted");
        fetchPosts();
      }
    } catch {
      toast.error("Failed to delete question");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "like", postId }),
      });

      if (res.ok) {
        fetchPosts();
      }
    } catch {
      toast.error("Failed to like");
    }
  };

  const handlePin = async (postId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pin", postId }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.isPinned ? "Question pinned" : "Question unpinned");
        fetchPosts();
      }
    } catch {
      toast.error("Failed to pin");
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "save", postId }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.isSaved ? "Question saved" : "Question unsaved");
        fetchPosts();
      }
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleFlag = async (postId: string) => {
    toast.info("Post flagged for review");
  };

  const handleShare = async (postContent: string) => {
    try {
      await navigator.clipboard.writeText(postContent.substring(0, 100) + "...");
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comment",
          postId,
          content,
          authorName: user?.name,
          authorEmail: user?.email,
          authorAvatar: user?.avatar,
        }),
      });

      if (res.ok) {
        setNewComment({ ...newComment, [postId]: "" });
        fetchPosts();
      }
    } catch {
      toast.error("Failed to add answer");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm("Delete this answer?")) return;

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "deleteComment", postId, commentId }),
      });

      if (res.ok) {
        toast.success("Answer deleted");
        fetchPosts();
      }
    } catch {
      toast.error("Failed to delete answer");
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || (post.tags && post.tags.includes(filterTag));
    return matchesSearch && matchesTag;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    if (sortBy === "votes") {
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    } else if (sortBy === "unanswered") {
      return (a.comments?.length || 0) - (b.comments?.length || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 15);

  // Separate content into its own component to use useSearchParams
  return <CommunityContent 
    user={user} 
    posts={sortedPosts} 
    filteredPostsCount={filteredPosts.length}
    setPosts={setPosts}
    searchQuery={searchQuery}
    sortBy={sortBy}
    setSortBy={setSortBy}
    filterTag={filterTag}
    setFilterTag={setFilterTag}
    newPost={newPost}
    setNewPost={setNewPost}
    newTags={newTags}
    setNewTags={setNewTags}
    tagInput={tagInput}
    setTagInput={setTagInput}
    expandedComments={expandedComments}
    setExpandedComments={setExpandedComments}
    newComment={newComment}
    setNewComment={setNewComment}
    posting={posting}
    setPosting={setPosting}
    loading={loading}
    showNewPostForm={showNewPostForm}
    setShowNewPostForm={setShowNewPostForm}
    handleAddTag={handleAddTag}
    handleRemoveTag={handleRemoveTag}
    handleCreatePost={handleCreatePost}
    toggleComments={toggleComments}
    handleLike={handleLike}
    handleSave={handleSave}
    handleDeletePost={handleDeletePost}
    handleAddComment={handleAddComment}
    handlePin={handlePin}
    handleFlag={handleFlag}
    handleShare={handleShare}
    handleDeleteComment={handleDeleteComment}
  />;
}

function CommunityContent({
  user, posts, filteredPostsCount, setPosts, searchQuery, sortBy, setSortBy, filterTag, setFilterTag,
  newPost, setNewPost, newTags, setNewTags, tagInput, setTagInput,
  expandedComments, setExpandedComments, newComment, setNewComment,
  posting, setPosting, loading, showNewPostForm, setShowNewPostForm,
  handleAddTag, handleRemoveTag, handleCreatePost,
  toggleComments, handleLike, handleSave, handleDeletePost, handleAddComment, handlePin, handleFlag, handleShare, handleDeleteComment
}: {
  user: User | null; posts: Post[]; filteredPostsCount: number; setPosts: React.Dispatch<React.SetStateAction<Post[]>>; searchQuery: string; sortBy: string; setSortBy: React.Dispatch<React.SetStateAction<"votes" | "newest" | "unanswered">>; filterTag: string | null; setFilterTag: React.Dispatch<React.SetStateAction<string | null>>;
  newPost: string; setNewPost: React.Dispatch<React.SetStateAction<string>>; newTags: string[]; setNewTags: React.Dispatch<React.SetStateAction<string[]>>; tagInput: string; setTagInput: React.Dispatch<React.SetStateAction<string>>;
  expandedComments: Set<string>; setExpandedComments: React.Dispatch<React.SetStateAction<Set<string>>>; newComment: { [postId: string]: string }; setNewComment: React.Dispatch<React.SetStateAction<{ [postId: string]: string }>>;
  posting: boolean; setPosting: React.Dispatch<React.SetStateAction<boolean>>; loading: boolean; showNewPostForm: boolean; setShowNewPostForm: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddTag: (tag: string) => void; handleRemoveTag: (tag: string) => void; handleCreatePost: () => Promise<void>;
  toggleComments: (postId: string) => void; handleLike: (postId: string) => Promise<void>; handleSave: (postId: string) => Promise<void>; handleDeletePost: (postId: string) => Promise<void>; handleAddComment: (postId: string) => Promise<void>; handlePin: (postId: string) => Promise<void>; handleFlag: (postId: string) => Promise<void>; handleShare: (postContent: string) => Promise<void>; handleDeleteComment: (postId: string, commentId: string) => Promise<void>;
}) {
  const allTags = Array.from(new Set(posts.flatMap((p: Post) => p.tags || []))).slice(0, 15);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Inline Question Input */}
      <div 
        onClick={() => setShowNewPostForm(true)}
        className="bg-gray-100 dark:bg-gray-800/50 rounded-full px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
      >
        <span className="text-gray-500 dark:text-gray-400 text-sm">Ask a question or start a discussion...</span>
      </div>

      {/* New Post Form Modal */}
      {showNewPostForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Ask a question</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowNewPostForm(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <textarea
                placeholder="What's your question?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="w-full min-h-[120px] resize-none border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              
              {/* Manual tag input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddTag(tagInput)}
                  disabled={!tagInput.trim()}
                >
                  Add Tag
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {newTags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-gray-200 text-gray-700 flex items-center gap-1">
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-gray-900">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.filter(t => !newTags.includes(t)).slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-1 text-xs rounded-full border hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowNewPostForm(false)}>Cancel</Button>
                <Button onClick={handleCreatePost} disabled={posting || newPost.trim().length < 10 || newTags.length === 0} className="bg-gray-900 hover:bg-gray-800 text-white">
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort Filters */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        <Button 
          variant={sortBy === "newest" ? "default" : "ghost"} 
          size="sm" 
          className={sortBy === "newest" ? "bg-gray-900 text-white" : ""}
          onClick={() => setSortBy("newest")}
        >
          Newest
        </Button>
        <Button 
          variant={sortBy === "votes" ? "default" : "ghost"} 
          size="sm" 
          className={sortBy === "votes" ? "bg-gray-900 text-white" : ""}
          onClick={() => setSortBy("votes")}
        >
          Most Voted
        </Button>
        <Button 
          variant={sortBy === "unanswered" ? "default" : "ghost"} 
          size="sm" 
          className={sortBy === "unanswered" ? "bg-gray-900 text-white" : ""}
          onClick={() => setSortBy("unanswered")}
        >
          Unanswered
        </Button>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterTag === null ? "default" : "outline"}
            size="sm"
            className={filterTag === null ? "bg-gray-900 text-white" : ""}
            onClick={() => setFilterTag(null)}
          >
            All
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={filterTag === tag ? "default" : "outline"}
              size="sm"
              className={filterTag === tag ? "bg-gray-900 text-white" : ""}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
            >
              #{tag}
            </Button>
          ))}
        </div>
      )}

      {/* Questions List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg">No questions found</h3>
            <p className="text-muted-foreground">Be the first to ask!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => {
            const isLiked = user && post.likes?.includes(user.id);
            const isSaved = user && post.saved?.includes(user.id);
            const isOwner = user && post.authorId === user.id;
            
              return (
              <Card key={post._id} className={`hover:shadow-sm transition-shadow ${post.isPinned ? "border border-primary/50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Stats Column */}
                    <div className="flex flex-col items-center gap-2 min-w-[40px]">
                      {/* Like */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`transition-colors ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                        >
                          <Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} />
                        </button>
                        <span className="text-xs font-semibold">{post.likes?.length || 0}</span>
                      </div>
                      
                      <Separator className="w-full" />
                      
                      {/* Comments */}
                      <div className="flex flex-col items-center">
                        <button onClick={() => toggleComments(post._id)} className="text-muted-foreground hover:text-primary">
                          <MessageCircle className={`size-4 ${(post.comments?.length || 0) > 0 ? "text-green-600" : ""}`} />
                        </button>
                        <span className={`text-xs font-semibold ${(post.comments?.length || 0) > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                          {post.comments?.length || 0}
                        </span>
                      </div>
                      
                      <Separator className="w-full" />
                      
                      {/* Pin */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handlePin(post._id)}
                          className={`transition-colors ${post.isPinned ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                          title={post.isPinned ? "Unpin question" : "Pin question to profile"}
                        >
                          <Pin className={`size-4 ${post.isPinned ? "fill-current" : ""}`} />
                        </button>
                        <span className="text-[9px] text-muted-foreground">pin</span>
                      </div>
                      
                      <Separator className="w-full" />
                      
                      {/* Save */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleSave(post._id)}
                          className={`transition-colors ${post.saved?.includes(user?.id || "") ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
                          title={post.saved?.includes(user?.id || "") ? "Unsave question" : "Save question"}
                        >
                          <Bookmark className={`size-4 ${post.saved?.includes(user?.id || "") ? "fill-current" : ""}`} />
                        </button>
                        <span className="text-[9px] text-muted-foreground">save</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Pinned Badge */}
                      {post.isPinned && (
                        <Badge className="gap-1 w-fit bg-black text-white hover:bg-black/80">
                          <Pin className="size-3" />
                          Pinned
                        </Badge>
                      )}
                      
                      <h3 className="text-sm font-medium leading-snug hover:text-primary cursor-pointer line-clamp-2">
                        {escapeHtml(post.content)}
                      </h3>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((tag: string, index: number) => {
                            const tagColors = [
                              "bg-blue-100 text-blue-700 hover:bg-blue-200",
                              "bg-green-100 text-green-700 hover:bg-green-200", 
                              "bg-purple-100 text-purple-700 hover:bg-purple-200",
                              "bg-orange-100 text-orange-700 hover:bg-orange-200",
                              "bg-pink-100 text-pink-700 hover:bg-pink-200",
                              "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
                            ];
                            const colorClass = tagColors[index % tagColors.length];
                            return (
                              <button
                                key={tag}
                                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                                className={`px-1.5 py-0.5 text-[10px] rounded-full transition-colors ${colorClass} ${filterTag === tag ? "ring-1 ring-primary" : ""}`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        {/* Left: Meta info */}
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <button onClick={() => toggleComments(post._id)} className="hover:text-primary">
                            {post.comments?.length || 0} answers
                          </button>
                          <span className="flex items-center gap-0.5">
                            <Clock className="size-2.5" />
                            {getHoursUntilExpiry(post.expiresAt)}h left
                          </span>
                        </div>

                        {/* Right: Author */}
                        <Link href={`/community/profile/${post.authorId}`} className="flex items-center gap-1.5 hover:bg-muted/50 px-1.5 py-0.5 rounded transition-colors">
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt))}
                          </span>
                          <Avatar className="size-5">
                            {post.authorAvatar ? (
                              <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                            ) : null}
                            <AvatarFallback className="text-[8px] bg-muted text-muted-foreground">
                              {post.authorName?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground hover:text-primary">
                            {escapeHtml(post.authorName || "Anonymous")}
                          </span>
                        </Link>
                      </div>

                      {/* Actions - Compact */}
                      <div className="flex items-center gap-0.5 pt-1">
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] gap-0.5" onClick={() => handleLike(post._id)}>
                          <Heart className={`size-2.5 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                          <span className={isLiked ? "text-red-500" : "text-muted-foreground"}>{isLiked ? "Liked" : "Like"}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] gap-0.5" onClick={() => handleShare(post.content)}>
                          <Share2 className="size-2.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Share</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] gap-0.5" onClick={() => handleFlag(post._id)}>
                          <Flag className="size-2.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Flag</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] gap-0.5" onClick={() => handlePin(post._id)}>
                          <Pin className={`size-2.5 ${post.isPinned ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                          <span className={post.isPinned ? "text-primary" : "text-muted-foreground"}>{post.isPinned ? "Pinned" : "Pin"}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] gap-0.5" onClick={() => handleSave(post._id)}>
                          <Bookmark className={`size-2.5 ${isSaved ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                          <span className={isSaved ? "text-yellow-500" : "text-muted-foreground"}>{isSaved ? "Saved" : "Save"}</span>
                        </Button>
                        {(isOwner || user?.role === "admin") && (
                          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] gap-0.5 text-destructive" onClick={() => handleDeletePost(post._id)}>
                            <Trash2 className="size-2.5" />
                            <span>Delete</span>
                          </Button>
                        )}
                      </div>

                      {/* Answers Section */}
                      {expandedComments.has(post._id) && (
                        <div className="pt-3 border-t space-y-3">
                          <h4 className="font-semibold text-xs">{post.comments?.length || 0} Answers</h4>
                          
                          {post.comments && post.comments.length > 0 && (
                            <div className="space-y-2">
                              {post.comments.map((comment: Comment) => (
                                <div key={comment._id} className="flex gap-2 p-2 bg-muted/50 rounded-lg">
                                  <Avatar className="size-6">
                                    {comment.authorAvatar ? (
                                      <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                                    ) : null}
                                    <AvatarFallback className="text-[10px] bg-secondary">
                                      {comment.authorName?.charAt(0).toUpperCase() || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-0.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <Link href={`/community/profile/${comment.authorId}`} className="text-xs font-medium text-primary hover:underline">
                                          {escapeHtml(comment.authorName)}
                                        </Link>
                                        <span className="text-[10px] text-muted-foreground">
                                          {formatDistanceToNow(new Date(comment.createdAt))}
                                        </span>
                                      </div>
                                      {(comment.authorId === user?.id || user?.role === "admin") && (
                                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteComment(post._id, comment._id)}>
                                          <Trash2 className="size-2.5" />
                                        </Button>
                                      )}
                                    </div>
                                    <p className="text-xs">{escapeHtml(comment.content)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Input
                              placeholder="Write your answer..."
                              value={newComment[post._id] || ""}
                              onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                              onKeyDown={(e) => e.key === "Enter" && handleAddComment(post._id)}
                              className="flex-1 h-8 text-xs"
                            />
                            <Button size="sm" className="h-8" onClick={() => handleAddComment(post._id)}>
                              <Send className="size-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}