"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
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
        toast.error(data.error || "Failed to get response");
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't answer that. Please try again." }]);
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
        className="fixed bottom-6 right-24 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#C41E3A] to-[#a01830] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Open AI Chat"
      >
        <Bot className="size-5" />
        <span className="text-sm font-medium">AI Helper</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#C41E3A]/10 to-[#C41E3A]/5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C41E3A] flex items-center justify-center">
                <Bot className="size-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">AI Tutor</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {remaining !== null ? `${remaining} questions left today` : "Loading..."}
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
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-[#C41E3A] text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2.5 border border-gray-100 dark:border-gray-700">
                  <Loader2 className="size-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
            {remaining !== null && remaining > 0 ? (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                  disabled={loading}
                  className="h-9 text-sm bg-gray-50 dark:bg-gray-800 border-none"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="h-9 w-9 shrink-0 bg-[#C41E3A] hover:bg-[#a01830]"
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