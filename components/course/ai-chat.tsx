"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AIChat({ lessonTitle, lessonContent }: { lessonTitle?: string; lessonContent?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  async function fetchRemaining() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayQuestions = (data.user.chatQuestions || []).filter(
          (q: { answeredAt: string }) => new Date(q.answeredAt) >= today
        );
        setRemaining(5 - todayQuestions.length);
      }
    } catch {
      setRemaining(0);
    }
  }

  function openChat() {
    setIsOpen(true);
    if (!initialized) {
      setMessages([
        {
          role: "assistant",
          content: "Hi! I'm your AI learning assistant. Ask me anything about this lesson! You can ask up to 5 questions per day.",
        },
      ]);
      setInitialized(true);
      fetchRemaining();
    }
  }

  async function handleSend() {
    if (!input.trim() || remaining === 0) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const context = lessonTitle 
        ? `Lesson: ${lessonTitle}. ${lessonContent ? `Content: ${lessonContent.substring(0, 500)}...` : ""}` 
        : "General course questions";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage, context }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.details
          ? `${data.error}: ${JSON.stringify(data.details).substring(0, 200)}`
          : data.error || "Failed to get response";
        toast.error(errorMsg);
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errorMsg}` }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      setRemaining(data.remainingQuestions);
    } catch {
      toast.error("Failed to send question");
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={openChat}
        className="fixed bottom-6 right-24 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Open AI Chat"
      >
        <span className="text-base font-bold">AI</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <span className="text-xs font-bold text-white">AI</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">AI Assistant</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {remaining !== null ? `${remaining} questions left today` : "Loading..."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="size-4 text-gray-500" />
            </button>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-black text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2.5 border border-gray-200 dark:border-gray-700">
                  <Loader2 className="size-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
            {remaining !== null && remaining > 0 ? (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                  disabled={loading}
                  className="h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="h-9 w-9 shrink-0 bg-black hover:bg-gray-800"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="text-xs text-center text-gray-500 py-2">
                You've reached your 5 daily questions. Come back tomorrow!
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}