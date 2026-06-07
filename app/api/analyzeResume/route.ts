// POST /api/analyze-resume — Comprehensive resume scorecard analysis

import { NextResponse } from "next/server";
import { analyzeResume } from "@/lib/resumeAnalysis";
import { ResumeProfileSchema } from "@/lib/schemas";
import { isRateLimited, getClientIP } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: true, code: "RATE_LIMIT", message: "Too many requests. Try again shortly." },
        { status: 429 },
      );
    }

    const body = await request.json() as { resume: unknown };

    const resumeResult = ResumeProfileSchema.safeParse(body.resume);
    if (!resumeResult.success) {
      return NextResponse.json(
        { error: true, code: "VALIDATION_ERROR", message: "Invalid resume structure.", details: resumeResult.error.issues },
        { status: 422 },
      );
    }

    const analysis = await analyzeResume(resumeResult.data);
    return NextResponse.json(analysis);
  } catch (err: unknown) {
    const structured = err as { error?: boolean; code?: string; message?: string; details?: unknown };
    if (structured?.error) {
      return NextResponse.json(structured, { status: 422 });
    }
    return NextResponse.json(
      { error: true, code: "LLM_ERROR", message: "Failed to analyze resume" },
      { status: 422 },
    );
  }
}
