"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { MessageCircle, Pin, Heart, Send, Clock, User, Lock, Crown, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Post {
  _id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  isPinned: boolean;
  likes: string[];
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

interface ChatMessage {
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

type TabType = "home" | "posts" | "chat";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

function getTimeRemaining(expiresAt: string): string {
  const expires = new Date(expiresAt);
  const now = new Date();
  const diff = expires.getTime() - now.getTime();
  
  if (diff <= 0) return "Expired";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/community?type=posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChat = useCallback(async () => {
    try {
      const res = await fetch("/api/community?type=chat&limit=100");
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching chat:", err);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchChat();
    }
  }, [user, fetchPosts, fetchChat]);

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (activeTab === "chat") {
      const interval = setInterval(fetchChat, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchChat]);

  const handleCreatePost = async () => {
    if (!newPost.trim() || newPost.trim().length < 10) {
      toast.error("Post must be at least 10 characters");
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
          authorName: user?.name,
          authorEmail: user?.email,
          authorAvatar: user?.avatar,
        }),
      });

      if (res.ok) {
        toast.success("Question posted!");
        setNewPost("");
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setPosting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          content: newMessage,
          authorName: user?.name,
          authorEmail: user?.email,
          authorAvatar: user?.avatar,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchChat();
      } else {
        toast.error("Failed to send message");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setPosting(false);
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
        const data = await res.json();
        setPosts(posts.map(p => 
          p._id === postId 
            ? { ...p, likes: data.liked ? [...p.likes, user?.id || ""] : p.likes.filter(id => id !== user?.id) }
            : p
        ));
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
        setPosts(posts.map(p => 
          p._id === postId ? { ...p, isPinned: data.isPinned } : p
        ));
        toast.success(data.isPinned ? "Post pinned" : "Post unpinned");
      }
    } catch {
      toast.error("Failed to pin");
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
      toast.error("Failed to add comment");
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

  const renderPost = (post: Post, isPinned = false) => (
    <div
      key={post._id}
      className={`bg-card border rounded-xl p-4 ${isPinned ? "border-primary/50 bg-primary/5" : ""}`}
    >
      {isPinned && (
        <div className="flex items-center gap-1 text-primary text-xs font-medium mb-2">
          <Pin className="size-3" />
          Pinned
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {post.authorAvatar ? (
            <Image src={post.authorAvatar} alt="" width={40} height={40} className="object-cover" />
          ) : (
            <span className="text-sm font-bold text-white">{post.authorName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{escapeHtml(post.authorName)}</span>
            <span className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <Clock className="size-3" />
              {getTimeRemaining(post.expiresAt)}
            </span>
          </div>
          <p className="mt-2 text-sm whitespace-pre-wrap">{escapeHtml(post.content)}</p>
          
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => handleLike(post._id)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                post.likes.includes(user?.id || "") ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart className={`size-4 ${post.likes.includes(user?.id || "") ? "fill-current" : ""}`} />
              {post.likes.length}
            </button>
            <button
              onClick={() => toggleComments(post._id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="size-4" />
              {post.comments.length}
            </button>
            {user?.role === "admin" && (
              <button
                onClick={() => handlePin(post._id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  post.isPinned ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Pin className="size-4" />
              </button>
            )}
          </div>

          {expandedComments.has(post._id) && (
            <div className="mt-3 space-y-3 pl-2 border-l-2 border-muted">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-2">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {comment.authorAvatar ? (
                      <Image src={comment.authorAvatar} alt="" width={32} height={32} className="object-cover" />
                    ) : (
                      <span className="text-xs font-bold">{comment.authorName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">{escapeHtml(comment.authorName)}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{escapeHtml(comment.content)}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment[post._id] || ""}
                  onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment(post._id)}
                  className="flex-1 text-sm px-3 py-2 border rounded-lg bg-background"
                />
                <Button size="sm" onClick={() => handleAddComment(post._id)}>Send</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card border-b sticky top-14 z-40">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "home" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <MessageCircle className="size-4" />
              Accueil
            </span>
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "posts" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Pin className="size-4" />
              All Posts
            </span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "chat" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <MessageCircle className="size-4" />
              Chat
            </span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === "home" && (
          <div className="space-y-4">
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="" width={40} height={40} className="object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  {showNewPostForm ? (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Ask a question... (will expire in 24h)"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          Expires in 24 hours
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowNewPostForm(false)}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleCreatePost} disabled={posting}>
                            {posting ? "Posting..." : "Post Question"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewPostForm(true)}
                      className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors text-muted-foreground"
                    >
                      Ask a question to the community...
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border rounded-xl p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="size-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="size-12 mx-auto mb-3 opacity-30" />
                <p>No questions yet. Be the first to ask!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.filter(p => p.isPinned).map((post) => renderPost(post, true))}
                {posts.filter(p => !p.isPinned).slice(0, 5).map((post) => renderPost(post))}
              </div>
            )}
          </div>
        )}

        {activeTab === "posts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">All Posts</h2>
              <Button size="sm" onClick={() => { setActiveTab("home"); setShowNewPostForm(true); }}>
                New Question
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-card border rounded-xl p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="size-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Pin className="size-12 mx-auto mb-3 opacity-30" />
                <p>No posts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => renderPost(post))}
              </div>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 overflow-y-auto space-y-3 p-2">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="size-12 mx-auto mb-3 opacity-30" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex gap-2 ${message.authorId === user?.id ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`size-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 overflow-hidden ${
                      message.authorId === user?.id ? "from-green-500 to-green-600" : "from-primary to-primary/60"
                    }`}>
                      {message.authorAvatar ? (
                        <Image src={message.authorAvatar} alt="" width={32} height={32} className="object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white">{message.authorName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className={`max-w-[70%] ${message.authorId === user?.id ? "text-right" : ""}`}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {message.authorId !== user?.id && <span className="font-medium">{escapeHtml(message.authorName)}</span>}
                        <span>{formatTimeAgo(message.createdAt)}</span>
                      </div>
                      <div className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                        message.authorId === user?.id 
                          ? "bg-primary text-white rounded-br-md" 
                          : "bg-muted rounded-bl-md"
                      }`}>
                        {escapeHtml(message.content)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t bg-card p-3 rounded-b-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-4 py-2 border rounded-full bg-background"
                />
                <Button size="icon" onClick={handleSendMessage} disabled={posting || !newMessage.trim()}>
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}