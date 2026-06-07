// POST /api/assemble — Final resume assembly from tailored parts (skills reordering, summary polish)

import { NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { TailoredResumeSchema, JobDescriptionProfileSchema } from "@/lib/schemas";
import { buildResumeAssemblerPrompt } from "@/prompts";
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

    // ── Parse & Validate Input ─────────────────────────────────
    const body = await request.json() as { tailored: unknown; jd: unknown };

    const tailoredResult = TailoredResumeSchema.safeParse(body.tailored);
    if (!tailoredResult.success) {
      return NextResponse.json(
        { error: true, code: "VALIDATION_ERROR", message: "Invalid tailored resume structure.", details: tailoredResult.error.issues },
        { status: 422 },
      );
    }

    const jdResult = JobDescriptionProfileSchema.safeParse(body.jd);
    if (!jdResult.success) {
      return NextResponse.json(
        { error: true, code: "VALIDATION_ERROR", message: "Invalid JD structure.", details: jdResult.error.issues },
        { status: 422 },
      );
    }

    // ── Call LLM ───────────────────────────────────────────────
    const { systemPrompt, userPrompt } = buildResumeAssemblerPrompt(tailoredResult.data, jdResult.data);
    const result = await callLLM(systemPrompt, userPrompt, TailoredResumeSchema);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const structured = err as { error?: boolean; code?: string; message?: string; details?: unknown };
    if (structured?.error) {
      return NextResponse.json(structured, { status: 422 });
    }
    return NextResponse.json(
      { error: true, code: "LLM_ERROR", message: "Failed to assemble resume" },
      { status: 422 },
    );
  }
}

