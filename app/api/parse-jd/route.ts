// POST /api/parse-jd — Extract structured JobDescriptionProfile from raw JD text

import { NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { JobDescriptionProfileSchema } from "@/lib/schemas";
import { buildJDExtractionPrompt } from "@/prompts";
import { isRateLimited, getClientIP } from "@/lib/rate-limiter";

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
    const body = await request.json() as { text: string };

    if (!body.text?.trim()) {
      return NextResponse.json(
        { error: true, code: "PARSE_ERROR", message: "Job description text is required." },
        { status: 422 },
      );
    }

    // ── Call LLM ───────────────────────────────────────────────
    const { systemPrompt, userPrompt } = buildJDExtractionPrompt(body.text);
    const result = await callLLM(systemPrompt, userPrompt, JobDescriptionProfileSchema);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const structured = err as { error?: boolean; code?: string; message?: string; details?: unknown };
    if (structured?.error) {
      return NextResponse.json(structured, { status: 422 });
    }
    return NextResponse.json(
      { error: true, code: "LLM_ERROR", message: "Failed to parse job description" },
      { status: 422 },
    );
  }
}

