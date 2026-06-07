// POST /api/chat — Conversational ATS assistant using DeepSeek

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { isRateLimited, getClientIP } from "@/lib/rate-limiter";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
});

const MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) and resume optimization assistant embedded inside a product called "Resume Shapeshifter".

Your role is to help the user improve their resume's ATS score by giving actionable, specific advice.

RULES:
1. Be specific — reference the user's actual resume content, skills, and experience.
2. Never suggest fabrication. Always say "if you have this experience" when uncertain.
3. Keep answers concise (2-4 paragraphs max).
4. Format suggestions as clear bullet points when listing improvements.
5. If the user asks about a specific keyword or skill, explain how it matters for ATS parsing.
6. If the user hasn't uploaded a resume yet, gently remind them to do so.
7. Use plain English — avoid jargon unless explaining it.

TOPICS YOU CAN HELP WITH:
- ATS keyword optimization
- Bullet point rewording for better parsing
- Skills section formatting
- Missing keywords for specific roles
- Resume structure recommendations
- Industry-specific ATS tips
- How to quantify achievements
- Which sections matter most`;

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Store recent conversations in memory (volatile, per-server)
const conversations = new Map<string, Message[]>();

export async function POST(request: Request) {
  try {
    // ── Rate Limiting ──────────────────────────────────────────
    const ip = getClientIP(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: true, code: "RATE_LIMIT", message: "Too many requests. Try again shortly." },
        { status: 429 },
      );
    }

    // ── Parse Input ────────────────────────────────────────────
    const body = (await request.json()) as {
      message: string;
      sessionId?: string;
      resumeContext?: string;
      jdContext?: string;
    };

    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: true, code: "PARSE_ERROR", message: "Message is required." },
        { status: 422 },
      );
    }

    // Security: limit message length to prevent abuse
    if (body.message.length > 5000) {
      return NextResponse.json(
        { error: true, code: "PARSE_ERROR", message: "Message too long (max 5000 characters)." },
        { status: 422 },
      );
    }

    const sessionId = body.sessionId ?? `session_${ip}`;

    // ── Build Conversation ─────────────────────────────────────
    const systemPrompt =
      SYSTEM_PROMPT +
      (body.resumeContext
        ? `\n\nUSER'S RESUME CONTEXT:\n${body.resumeContext.slice(0, 3000)}`
        : "") +
      (body.jdContext
        ? `\n\nTARGET JOB DESCRIPTION:\n${body.jdContext.slice(0, 2000)}`
        : "");

    // Initialize or get conversation history (keep last 10 messages)
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }

    const history = conversations.get(sessionId)!;

    // Build full message list
    const messages: Message[] = [{ role: "system", content: systemPrompt }, ...history.slice(-10), { role: "user", content: body.message }];

    // ── Call DeepSeek ──────────────────────────────────────────
    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1024,
      messages,
    });

    const reply = response.choices[0]?.message?.content ?? "I'm sorry, I couldn't process that request.";

    // ── Update History ─────────────────────────────────────────
    history.push({ role: "user", content: body.message });
    history.push({ role: "assistant", content: reply });

    // Trim history to last 20 messages to prevent memory bloat
    const trimmed = history.slice(-20);
    conversations.set(sessionId, trimmed);

    // Cleanup stale sessions every 50 requests
    if (conversations.size > 100) {
      const keys = Array.from(conversations.keys());
      const toDelete = keys.slice(0, keys.length - 50);
      for (const k of toDelete) conversations.delete(k);
    }

    return NextResponse.json({ reply, sessionId });
  } catch (err: unknown) {
    const apiErr = err as { status?: number; message?: string };
    if (apiErr.status === 401) {
      return NextResponse.json(
        { error: true, code: "LLM_ERROR", message: "DeepSeek API key is invalid or not set. Add it in .env.local." },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { error: true, code: "LLM_ERROR", message: apiErr.message ?? "Chat failed. Try again." },
      { status: 422 },
    );
  }
}
