"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState(5);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        if (data?.user) {
          setUserName(data.user.name || "User");
          setUserEmail(data.user.email || "");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen && !fetched) {
      setLoading(true);
      fetch("/api/support")
        .then((res) => res.ok ? res.json() : Promise.reject())
        .then((data) => {
          setMessages(data.messages || []);
          setRemaining(data.remaining ?? 5);
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
          setFetched(true);
        });
    }
  }, [isOpen, fetched]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || remaining <= 0) return;

    setSending(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          userName,
          userEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send message");
        return;
      }

      setMessages((prev) => [...prev, data.message]);
      setRemaining(data.remaining);
      setInput("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        aria-label="Open support chat"
      >
        {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div>
              <h3 className="text-sm font-semibold">Support</h3>
              <p className="text-xs text-muted-foreground">
                {remaining > 0
                  ? `${remaining} message${remaining !== 1 ? "s" : ""} left`
                  : "Limit reached"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-muted/10">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No messages yet. Send us a question!
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.isAdmin
                        ? "bg-muted text-foreground rounded-bl-sm"
                        : "bg-primary text-primary-foreground rounded-br-sm"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.isAdmin ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-3 bg-background">
            {remaining > 0 ? (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                  disabled={sending}
                  className="h-9 text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  size="icon"
                  className="h-9 w-9 shrink-0"
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                <AlertCircle className="size-3.5 shrink-0" />
                All 5 messages used. Contact admin directly.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
