"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/useAppStore";
import { MessageCircle, X, Send, Loader2, Sparkles, Bot } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your ATS assistant. Ask me anything about improving your resume — keywords, formatting, section tips, or how to optimize for a specific job description.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { resumeParsed, jdParsed } = useAppStore();

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      // Build context from store
      const resumeContext = resumeParsed
        ? `Name: ${resumeParsed.contact?.name ?? "Unknown"}\nSummary: ${resumeParsed.summary ?? "N/A"}\nSkills: ${(resumeParsed.skills ?? []).join(", ")}\nExperience: ${(resumeParsed.experience ?? []).map((e) => `${e.title} at ${e.company} (${e.startDate ?? ""}-${e.endDate ?? ""}): ${e.bullets.map((b) => b.text).join("; ")}`).join("\n")}\nEducation: ${(resumeParsed.education ?? []).map((e) => `${e.degree} in ${e.field ?? ""} from ${e.institution}`).join("\n")}`
        : "";

      const jdContext = jdParsed
        ? `Title: ${jdParsed.jobTitle}\nCompany: ${jdParsed.company ?? "N/A"}\nRequired Skills: ${(jdParsed.requiredSkills ?? []).join(", ")}\nResponsibilities: ${(jdParsed.responsibilities ?? []).join("; ")}`
        : "";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId,
          resumeContext,
          jdContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `❌ ${data.message ?? "Failed to get response"}` },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open ATS chat assistant"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">ATS Chat Assistant</p>
              <p className="text-[10px] text-muted-foreground">Powered by DeepSeek</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-yellow-400" />
              ATS tips
            </div>
          </div>

          {/* Messages */}
          <div className="flex h-[400px] flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about ATS optimization..."
                className="min-h-[40px] resize-none text-sm"
                rows={1}
                aria-label="Ask about ATS optimization"
              />
              <Button
                size="icon"
                className="h-10 w-10 shrink-0"
                disabled={!input.trim() || loading}
                onClick={handleSend}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
