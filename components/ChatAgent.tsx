"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/useAppStore";
import { MessageCircle, X, Send, Loader2, Sparkles, FileEdit, Check } from "lucide-react";
import { toast } from "sonner";

// ── Edit action types ───────────────────────────────────────────
type ResumeEdit =
  | { action: "update_skills"; data: { skills: string[] } }
  | { action: "add_skill"; data: { skill: string } }
  | { action: "update_summary"; data: { summary: string } }
  | { action: "update_bullet"; data: { company: string; title: string; bulletIndex: number; newText: string } }
  | { action: "update_contact"; data: { field: string; value: string } }
  | { action: "add_certification"; data: { certification: string } };

function parseEditBlock(text: string): { cleanText: string; edit: ResumeEdit | null } {
  const match = text.match(/<!-- RESUME_EDIT -->\s*(\{[\s\S]*?\})\s*<!-- END_EDIT -->/);
  if (!match) return { cleanText: text, edit: null };
  try {
    const edit = JSON.parse(match[1]) as ResumeEdit;
    return { cleanText: text.replace(match[0], "").trim(), edit };
  } catch {
    return { cleanText: text, edit: null };
  }
}

function applyEdit(edit: ResumeEdit): boolean {
  const state = useAppStore.getState();
  const resume = state.resumeParsed;
  if (!resume) return false;
  switch (edit.action) {
    case "update_skills":
      useAppStore.setState({ resumeParsed: { ...resume, skills: edit.data.skills } });
      return true;
    case "add_skill": {
      if (resume.skills.includes(edit.data.skill)) return false;
      useAppStore.setState({ resumeParsed: { ...resume, skills: [...resume.skills, edit.data.skill] } });
      return true;
    }
    case "update_summary":
      useAppStore.setState({ resumeParsed: { ...resume, summary: edit.data.summary } });
      return true;
    case "update_bullet": {
      const { company, title, bulletIndex, newText } = edit.data;
      const idx = resume.experience.findIndex((e) => e.company === company && e.title === title);
      if (idx === -1 || bulletIndex < 0 || bulletIndex >= resume.experience[idx].bullets.length) return false;
      const experience = resume.experience.map((e, i) =>
        i === idx ? { ...e, bullets: e.bullets.map((b, j) => (j === bulletIndex ? { ...b, text: newText } : b)) } : e,
      );
      useAppStore.setState({ resumeParsed: { ...resume, experience } });
      return true;
    }
    case "update_contact":
      useAppStore.setState({ resumeParsed: { ...resume, contact: { ...resume.contact, [edit.data.field]: edit.data.value } } });
      return true;
    case "add_certification":
      useAppStore.setState({ resumeParsed: { ...resume, certifications: [...(resume.certifications ?? []), edit.data.certification] } });
      return true;
  }
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  editApplied?: boolean;
  editType?: string;
}

export default function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your resume editor. Ask me to make changes — try:\n• \"Add SQL to my skills\"\n• \"Update my summary to mention data analysis\"\n• \"Add a Google Analytics certification\"\n• \"Rewrite my first bullet at Swiggy\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { resumeParsed, jdParsed } = useAppStore();

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
      const resumeContext = resumeParsed
        ? `Name: ${resumeParsed.contact?.name ?? "N/A"}\nSummary: ${resumeParsed.summary ?? "N/A"}\nSkills: ${(resumeParsed.skills ?? []).join(", ")}\nExperience: ${(resumeParsed.experience ?? []).map((e) => `${e.title} at ${e.company}: ${e.bullets.map((b) => b.text).join(" | ")}`).join("\n")}\nEducation: ${(resumeParsed.education ?? []).map((e) => `${e.degree} ${e.field ? `in ${e.field}` : ""} from ${e.institution}`).join(", ")}\nCertifications: ${(resumeParsed.certifications ?? []).join(", ")}`
        : "";

      const jdContext = jdParsed
        ? `Title: ${jdParsed.jobTitle}\nRequired Skills: ${(jdParsed.requiredSkills ?? []).join(", ")}`
        : "";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId, resumeContext, jdContext }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${data.message ?? "Failed"}` }]);
        return;
      }

      const { cleanText, edit } = parseEditBlock(data.reply);

      if (edit) {
        const applied = applyEdit(edit);
        const label = edit.action.replace(/_/g, " ");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: cleanText + (applied ? `\n\n✅ **Applied:** ${label}` : `\n\n⚠️ Could not apply: ${label}`),
            editApplied: applied,
            editType: edit.action,
          },
        ]);
        if (applied) toast.success(`Resume updated: ${label}`);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Network error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open resume editor"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <FileEdit className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">Resume Editor</p>
              <p className="text-[10px] text-muted-foreground">I can edit your resume live</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-yellow-400" />
              Live edits
            </div>
          </div>

          <div className="flex h-[400px] flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : msg.editApplied
                      ? "border border-green-500/30 bg-green-500/10 text-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                  {msg.editApplied && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-green-400">
                      <Check className="h-3 w-3" />
                      Applied to your resume
                    </div>
                  )}
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

          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder='Try: "Add SQL to my skills"...'
                className="min-h-[40px] resize-none text-sm"
                rows={1}
                aria-label="Ask the assistant to edit your resume"
              />
              <Button size="icon" className="h-10 w-10 shrink-0" disabled={!input.trim() || loading} onClick={handleSend} aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Ask to: add skills, rewrite bullets, update summary, add certifications
            </p>
          </div>
        </div>
      )}
    </>
  );
}
