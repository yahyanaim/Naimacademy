"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VoteButtonsProps {
  slug: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
}

export default function VoteButtons({ slug, initialUpvotes = 0, initialDownvotes = 0 }: VoteButtonsProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setIsLoggedIn(!!data?.user);
        if (data?.user) {
          fetchVotes();
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, [slug]);

  async function fetchVotes() {
    try {
      const res = await fetch(`/api/blog/vote?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        setUserVote(data.userVote);
      }
    } catch {
      // ignore
    }
  }

  async function handleVote(vote: "up" | "down") {
    if (!isLoggedIn) return;
    if (loading) return;
    
    if (userVote === vote) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/blog/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, vote }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to vote");
        setLoading(false);
        return;
      }
      
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(data.userVote);
    } catch {
      setError("Failed to vote");
    } finally {
      setLoading(false);
    }
  }

  if (isLoggedIn === null) {
    return (
      <div className="flex items-center gap-4 py-6 border-y">
        <div className="h-10 w-32 bg-muted rounded-full animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-4 py-6 border-y">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4" />
          <span>Sign in to vote on this article</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Link href="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Create Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  const score = upvotes - downvotes;

  return (
    <div className="flex items-center gap-4 py-6 border-y">
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleVote("up")}
          disabled={loading}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all ${
            userVote === "up"
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-black/10 hover:bg-emerald-100 text-black/70 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
          }`}
          title="Upvote"
        >
          <ThumbsUp className="size-5" />
        </button>
        <span className={`text-lg font-bold min-w-[3ch] text-center ${
          score > 0 ? "text-emerald-600" : score < 0 ? "text-red-600" : "text-muted-foreground"
        }`}>
          {score > 0 ? `+${score}` : score}
        </span>
        <button
          onClick={() => handleVote("down")}
          disabled={loading}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all ${
            userVote === "down"
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-black/10 hover:bg-red-100 text-black/70 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          }`}
          title="Downvote"
        >
          <ThumbsDown className="size-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{upvotes} upvotes</span>
        <span>{downvotes} downvotes</span>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
