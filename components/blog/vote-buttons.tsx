"use client";

import { useState, useEffect, useCallback } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
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

interface LoggedInUser {
  id: string;
  name: string;
  email: string;
}

export default function VoteButtons({ slug, initialUpvotes = 0, initialDownvotes = 0 }: VoteButtonsProps) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"checking" | "locked" | "identity" | "ready">("checking");
  const [voterName, setVoterName] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);

  const fetchVotes = useCallback(async (email: string) => {
    try {
      const params = new URLSearchParams({ slug });
      if (email) params.append("email", email);
      
      const res = await fetch(`/api/blog/vote?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        setUserVote(data.userVote);
      }
    } catch {
      // ignore
    }
  }, [slug]);

  const checkAuthAndVoter = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) {
          setLoggedInUser({
            id: authData.user.id,
            name: authData.user.name || authData.user.email?.split("@")[0] || "User",
            email: authData.user.email || "",
          });
          setVoterName(authData.user.name || authData.user.email?.split("@")[0] || "User");
          setVoterEmail(authData.user.email || "");
          await fetchVotes(authData.user.email?.toLowerCase() || "");
          setStep("ready");
          return;
        }
      }
    } catch {
      // not logged in, check localStorage
    }

    const stored = localStorage.getItem("user_identity");
    if (stored) {
      try {
        const identity = JSON.parse(stored);
        if (identity.name && identity.email) {
          setVoterName(identity.name || "");
          setVoterEmail(identity.email || "");
          await fetchVotes(identity.email);
          setStep("ready");
          return;
        }
      } catch {
        // invalid stored data
      }
    }

    const voteStored = localStorage.getItem(`vote_${slug}`);
    if (voteStored) {
      try {
        const voter: Voter = JSON.parse(voteStored);
        if (voter.name && voter.email) {
          setVoterName(voter.name);
          setVoterEmail(voter.email);
          await fetchVotes(voter.email);
          setStep("ready");
          return;
        }
      } catch {
        localStorage.removeItem(`vote_${slug}`);
      }
    }
    
    setStep("locked");
  }, [slug, fetchVotes]);

  useEffect(() => {
    checkAuthAndVoter();
  }, [slug, checkAuthAndVoter]);

  useEffect(() => {
    const handleIdentityUpdate = () => {
      checkAuthAndVoter();
    };

    window.addEventListener("identity-changed", handleIdentityUpdate);
    
    const interval = setInterval(() => {
      const updated = localStorage.getItem("identity_updated");
      if (updated) {
        localStorage.removeItem("identity_updated");
        checkAuthAndVoter();
      }
    }, 500);
    
    return () => {
      window.removeEventListener("identity-changed", handleIdentityUpdate);
      clearInterval(interval);
    };
  }, [slug, checkAuthAndVoter]);

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

    localStorage.setItem("user_identity", JSON.stringify({
      name: voterName.trim(),
      email: voterEmail.trim().toLowerCase(),
    }));
    window.dispatchEvent(new Event("identity-changed"));

    setStep("ready");
    fetchVotes(voterEmail.trim().toLowerCase());
  }

  async function handleVote(vote: "up" | "down") {
    if (step !== "ready") return;
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

      if (!loggedInUser) {
        localStorage.setItem(`vote_${slug}`, JSON.stringify({
          name: voterName.trim(),
          email: voterEmail.trim().toLowerCase(),
          vote: data.userVote || null,
        }));
        localStorage.setItem("user_identity", JSON.stringify({
          name: voterName.trim(),
          email: voterEmail.trim().toLowerCase(),
        }));
        window.dispatchEvent(new Event("identity-changed"));
      }
    } catch (err) {
      console.error("Vote error:", err);
      setError("Failed to vote");
    } finally {
      setLoading(false);
    }
  }

  if (step === "checking") {
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
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[120px] max-w-[150px]">
            <input
              type="text"
              placeholder="Name"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="relative flex-1 min-w-[160px] max-w-[200px]">
            <input
              type="email"
              placeholder="Email"
              value={voterEmail}
              onChange={(e) => setVoterEmail(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {error && <span className="text-xs text-red-500">{error}</span>}
          <Button onClick={handleIdentitySubmit} size="sm">
            Continue
          </Button>
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
          <span>Voted{loggedInUser ? " as " + loggedInUser.name : ""}</span>
        </div>
      )}
    </div>
  );
}
