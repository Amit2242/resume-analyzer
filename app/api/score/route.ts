// POST /api/score — Score resume against JD, return MatchScore

import { NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { MatchScoreSchema, ResumeProfileSchema, JobDescriptionProfileSchema } from "@/lib/schemas";
import { buildMatchScoringPrompt } from "@/prompts";
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
    const body = await request.json() as { resume: unknown; jd: unknown };

    const resumeResult = ResumeProfileSchema.safeParse(body.resume);
    if (!resumeResult.success) {
      return NextResponse.json(
        { error: true, code: "VALIDATION_ERROR", message: "Invalid resume structure.", details: resumeResult.error.issues },
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
    const { systemPrompt, userPrompt } = buildMatchScoringPrompt(resumeResult.data, jdResult.data);
    const result = await callLLM(systemPrompt, userPrompt, MatchScoreSchema);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const structured = err as { error?: boolean; code?: string; message?: string; details?: unknown };
    if (structured?.error) {
      return NextResponse.json(structured, { status: 422 });
    }
    return NextResponse.json(
      { error: true, code: "LLM_ERROR", message: "Failed to score resume" },
      { status: 422 },
    );
  }
}

