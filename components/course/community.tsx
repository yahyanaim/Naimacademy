"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Trash2, Send, Users, MessageCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Post {
  _id: string;
  content: string;
  likes: string[];
  user: { _id: string; name: string; email: string; avatar?: string };
  createdAt: string;
  expiresAt: string;
  isLiked: boolean;
}

interface ChatMessage {
  _id: string;
  content: string;
  userId: { _id: string; name: string; avatar?: string };
  createdAt: string;
}

interface CommunityProps {
  courseId: string;
  courseName: string;
}

export default function CourseCommunity({ courseId, courseName }: CommunityProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "chat">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const postsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPosts();
    loadChatMessages();
  }, [courseId]);

  useEffect(() => {
    if (activeTab === "posts") {
      const interval = setInterval(loadPosts, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, courseId]);

  useEffect(() => {
    if (activeTab === "chat") {
      const interval = setInterval(loadChatMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, courseId]);

  async function loadPosts() {
    try {
      const res = await fetch(`/api/community?courseId=${courseId}`);
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

  async function loadChatMessages() {
    try {
      const res = await fetch(`/api/community-chat?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch {
      // ignore
    }
  }

  async function createPost() {
    if (!newPost.trim() || posting) return;
    setPosting(true);

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, content: newPost.trim() }),
      });

      if (res.ok) {
        const post = await res.json();
        setPosts((prev) => [post, ...prev]);
        setNewPost("");
        toast.success("Post published!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to post");
      }
    } catch {
      toast.error("Failed to post");
    } finally {
      setPosting(false);
    }
  }

  async function toggleLike(postId: string) {
    try {
      const res = await fetch("/api/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, action: "like" }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, likes: data.likes, isLiked: data.isLiked } : p
          )
        );
      }
    } catch {
      // ignore
    }
  }

  async function deletePost(postId: string) {
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`/api/community?id=${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        toast.success("Post deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch("/api/community-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, content: newMessage.trim() }),
      });

      if (res.ok) {
        const message = await res.json();
        setChatMessages((prev) => [...prev, message]);
        setNewMessage("");
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  }

  function getTimeLeft(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  }

  return (
    <div className="bg-card rounded-lg border">
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "posts"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="size-4" />
            Posts
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "chat"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="size-4" />
            Group Chat
          </button>
        </div>
      </div>

      {activeTab === "posts" ? (
        <div>
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={`Share something about "${courseName}"...`}
                maxLength={500}
                className="flex-1 resize-none border rounded-lg p-3 text-sm min-h-[80px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    createPost();
                  }
                }}
              />
              <button
                onClick={createPost}
                disabled={!newPost.trim() || posting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {posting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{newPost.length}/500</p>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="divide-y">
                {posts.map((post) => (
                  <div key={post._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {post.user.avatar ? (
                          <img src={post.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-primary">
                            {post.user.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{post.user.name}</p>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {getTimeLeft(post.expiresAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button
                            onClick={() => toggleLike(post._id)}
                            className={`flex items-center gap-1 text-sm ${
                              post.isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                            }`}
                          >
                            <Heart className={`size-4 ${post.isLiked ? "fill-current" : ""}`} />
                            {post.likes.length}
                          </button>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleString()}
                          </span>
                          {post.user._id === "current-user" && (
                            <button
                              onClick={() => deletePost(post._id)}
                              className="text-muted-foreground hover:text-red-500 ml-auto"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Users className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg._id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {msg.userId.avatar ? (
                      <img src={msg.userId.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium text-primary">
                        {msg.userId.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{msg.userId.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
