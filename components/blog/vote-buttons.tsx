"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Lock, User, Mail, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoteButtonsProps {
  slug: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
}

interface Voter {
  name: string;
  email: string;
  vote: "up" | "down" | null;
}

export default function VoteButtons({ slug, initialUpvotes = 0, initialDownvotes = 0 }: VoteButtonsProps) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"locked" | "identity" | "voted">("locked");
  const [voterName, setVoterName] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkStoredVoter();
  }, [slug]);

  function checkStoredVoter() {
    const stored = localStorage.getItem(`vote_${slug}`);
    if (stored) {
      try {
        const voter: Voter = JSON.parse(stored);
        setVoterName(voter.name);
        setVoterEmail(voter.email);
        fetchVotes(voter.email);
        return;
      } catch {
        localStorage.removeItem(`vote_${slug}`);
      }
    }
    setCheckingAuth(false);
  }

  async function fetchVotes(email: string) {
    try {
      const res = await fetch(`/api/blog/vote?slug=${slug}&email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        setUserVote(data.userVote);
        if (data.userVote) {
          setStep("voted");
        } else {
          setStep("voted");
        }
      }
    } catch {
      // ignore
    } finally {
      setCheckingAuth(false);
    }
  }

  function handleStartVoting() {
    setStep("identity");
  }

  function handleIdentitySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!voterName.trim() || voterName.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (!voterEmail.trim() || !voterEmail.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    localStorage.setItem(`vote_${slug}`, JSON.stringify({
      name: voterName.trim(),
      email: voterEmail.trim().toLowerCase(),
      vote: null
    }));

    setStep("voted");
    fetchVotes(voterEmail.trim().toLowerCase());
  }

  async function handleVote(vote: "up" | "down") {
    if (step !== "voted") return;
    if (loading) return;
    if (userVote === vote) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/blog/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          vote,
          voterName: voterName.trim(),
          voterEmail: voterEmail.trim().toLowerCase(),
        }),
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

      localStorage.setItem(`vote_${slug}`, JSON.stringify({
        name: voterName.trim(),
        email: voterEmail.trim().toLowerCase(),
        vote: data.userVote || null,
      }));
    } catch {
      setError("Failed to vote");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center gap-4 py-6 border-y">
        <div className="h-10 w-32 bg-muted rounded-full animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  if (step === "locked") {
    return (
      <div className="flex items-center gap-4 py-6 border-y">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4" />
          <span>Enter your details to vote on this article</span>
        </div>
        <Button onClick={handleStartVoting} size="sm" className="ml-auto">
          Start Voting
        </Button>
      </div>
    );
  }

  if (step === "identity") {
    return (
      <div className="flex items-center gap-4 py-6 border-y">
        <form onSubmit={handleIdentitySubmit} className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-[150px]">
            <User className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Name"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <div className="relative flex-1 max-w-[200px]">
            <Mail className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={voterEmail}
              onChange={(e) => setVoterEmail(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          {error && <span className="text-xs text-red-500">{error}</span>}
          <Button type="submit" size="sm">
            Continue
          </Button>
          <button
            type="button"
            onClick={() => setStep("locked")}
            className="p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </form>
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
              : "bg-black/10 hover:bg-emerald-100 text-black/70 hover:text-emerald-600"
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
              : "bg-black/10 hover:bg-red-100 text-black/70 hover:text-red-600"
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

      {userVote && (
        <div className="ml-auto flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="size-3" />
          <span>Voted as {voterName}</span>
        </div>
      )}
    </div>
  );
}
