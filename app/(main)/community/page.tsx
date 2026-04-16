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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewPostForm(false);
          }}
        >
          <div className="bg-background rounded-2xl w-full max-w-xl mx-4 shadow-2xl border border-border/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative px-6 py-5 border-b border-border/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center">
                    <MessageCircle className="size-5 text-white dark:text-gray-900" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Ask a Question</h2>
                    <p className="text-xs text-muted-foreground">Share your knowledge or get help</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNewPostForm(false)}
                  className="size-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <X className="size-5 text-muted-foreground" />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Question Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Your Question</label>
                  <span className={`text-xs ${newPost.length < 10 ? 'text-muted-foreground' : 'text-green-600'}`}>
                    {newPost.length}/500
                  </span>
                </div>
                <textarea
                  placeholder="What's your question? Be specific and clear..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value.slice(0, 500))}
                  className="w-full min-h-[140px] resize-none border border-border rounded-xl p-4 text-sm bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                />
                {newPost.trim().length < 10 && newPost.length > 0 && (
                  <p className="text-xs text-amber-600">Minimum 10 characters required</p>
                )}
              </div>
              
              {/* Tags Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Add Tags <span className="text-muted-foreground font-normal">(at least 1 required)</span>
                </label>
                
                {/* Selected Tags */}
                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-border">
                    {newTags.map((tag, index) => {
                      const tagColors = [
                        "bg-blue-100 text-blue-700 border-blue-200",
                        "bg-green-100 text-green-700 border-green-200", 
                        "bg-purple-100 text-purple-700 border-purple-200",
                        "bg-orange-100 text-orange-700 border-orange-200",
                        "bg-pink-100 text-pink-700 border-pink-200",
                      ];
                      return (
                        <span 
                          key={tag} 
                          className={`px-3 py-1 text-xs rounded-full border flex items-center gap-1.5 font-medium ${tagColors[index % tagColors.length]}`}
                        >
                          #{tag}
                          <button 
                            onClick={() => handleRemoveTag(tag)} 
                            className="hover:opacity-70 transition-opacity ml-1"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                
                {/* Tag Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">#</span>
                    <input
                      type="text"
                      placeholder="Type a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      className="w-full pl-7 pr-3 py-2.5 text-sm border border-border rounded-xl bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag(tagInput)}
                    disabled={!tagInput.trim() || newTags.includes(tagInput) || newTags.length >= 5}
                    className="px-4 rounded-xl"
                  >
                    Add
                  </Button>
                </div>
                
                {/* Suggested Tags */}
                {newTags.length < 5 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Popular tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_TAGS.filter(t => !newTags.includes(t)).slice(0, 8).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleAddTag(tag)}
                          className="px-3 py-1.5 text-xs rounded-full border border-border hover:border-gray-900 dark:hover:border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-muted-foreground hover:text-foreground"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/50 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {newTags.length === 0 && <span className="text-amber-600">Add at least 1 tag</span>}
                {newTags.length > 0 && newTags.length < 5 && <span>{5 - newTags.length} more tag slots available</span>}
                {newTags.length >= 5 && <span className="text-green-600">Maximum tags reached</span>}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewPostForm(false);
                    setNewPost("");
                    setNewTags([]);
                    setTagInput("");
                  }}
                  className="rounded-xl px-5"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={posting || newPost.trim().length < 10 || newTags.length === 0}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl px-6 font-medium disabled:opacity-50"
                >
                  {posting ? "Posting..." : "Post Question"}
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
          <button
            onClick={() => setFilterTag(null)}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
              filterTag === null
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {allTags.map((tag, index) => {
            const tagColors = [
              "bg-blue-100 text-blue-700 hover:bg-blue-200",
              "bg-green-100 text-green-700 hover:bg-green-200",
              "bg-purple-100 text-purple-700 hover:bg-purple-200",
              "bg-orange-100 text-orange-700 hover:bg-orange-200",
              "bg-pink-100 text-pink-700 hover:bg-pink-200",
              "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
            ];
            const activeColors = [
              "bg-blue-500 text-white",
              "bg-green-500 text-white",
              "bg-purple-500 text-white",
              "bg-orange-500 text-white",
              "bg-pink-500 text-white",
              "bg-indigo-500 text-white",
            ];
            const colorClass = tagColors[index % tagColors.length];
            const activeClass = activeColors[index % activeColors.length];
            return (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  filterTag === tag ? activeClass : colorClass
                }`}
              >
                #{tag}
              </button>
            );
          })}
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

                      {/* Answers - Always Shown */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="pt-3 space-y-2">
                          {post.comments.map((comment: Comment) => (
                            <div key={comment._id} className="flex gap-2 text-xs">
                              <Avatar className="size-5">
                                {comment.authorAvatar ? (
                                  <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                                ) : null}
                                <AvatarFallback className="text-[8px]">
                                  {comment.authorName?.charAt(0).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <span className="font-medium">{comment.authorName}: </span>
                                <span>{escapeHtml(comment.content)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Answer Input */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Write an answer..."
                          value={newComment[post._id] || ""}
                          onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post._id);
                            }
                          }}
                          className="flex-1 h-8 px-3 text-xs border rounded-full focus:outline-none focus:ring-1"
                        />
                        <Button size="sm" className="h-8 px-3" onClick={() => handleAddComment(post._id)}>
                          <Send className="size-3" />
                        </Button>
                      </div>
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