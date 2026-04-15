"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  if (pathname?.startsWith("/certificate") || pathname?.startsWith("/community")) return null;

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
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      fetch("/api/support")
        .then((res) => res.ok ? res.json() : Promise.reject())
        .then((data) => {
          setMessages(data.messages || []);
          setRemaining(data.remaining ?? 5);
        })
        .catch(() => {});
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

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
        className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Open support chat"
      >
        {isOpen ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <MessageCircle className="size-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Support</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {remaining > 0
                    ? `${remaining} free messages`
                    : "Limit reached"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="size-4 text-gray-500" />
            </button>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="size-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Send us a message and we'll help!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.isAdmin
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm"
                        : "bg-gradient-to-r from-primary to-primary/90 text-white rounded-br-sm"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1.5 ${msg.isAdmin ? "text-gray-400" : "text-white/60"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
            {remaining > 0 ? (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write a message..."
                  onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                  disabled={sending}
                  className="h-10 text-sm bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  size="icon"
                  className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2.5">
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
