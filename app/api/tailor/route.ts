// POST /api/tailor — Generate tailored resume with per-bullet metadata

import { NextResponse } from "next/server";
import { z } from "zod";
import { callLLM } from "@/lib/llm";
import {
  BulletRewriteSchema,
  TailoredExperienceSchema,
  TailoredResumeSchema,
  ResumeProfileSchema,
  JobDescriptionProfileSchema,
} from "@/lib/schemas";
import { buildBulletRewriterPrompt } from "@/prompts";
import { isRateLimited, getClientIP } from "@/lib/rate-limiter";

const BulletRewriteArraySchema = z.array(BulletRewriteSchema);

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

    const resume = resumeResult.data;
    const jd = jdResult.data;

    // ── Rewrite bullets per experience entry ───────────────────
    const tailoredExperience: z.infer<typeof TailoredExperienceSchema>[] = [];

    for (const entry of resume.experience) {
      const bulletTexts = entry.bullets.map((b) => b.text);
      if (bulletTexts.length === 0) {
        // No bullets to rewrite — pass through
        tailoredExperience.push({
          company: entry.company,
          title: entry.title,
          bullets: [],
        });
        continue;
      }

      const { systemPrompt, userPrompt } = buildBulletRewriterPrompt(bulletTexts, jd);
      const rewrittenBullets = await callLLM(systemPrompt, userPrompt, BulletRewriteArraySchema);

      tailoredExperience.push({
        company: entry.company,
        title: entry.title,
        bullets: rewrittenBullets,
      });
    }

    // ── Assemble TailoredResume ────────────────────────────────
    const tailoredResume: z.infer<typeof TailoredResumeSchema> = {
      tailoredSummary: resume.summary ?? undefined,
      tailoredSkills: resume.skills,
      tailoredExperience,
    };

    // Validate assembly before returning
    const validated = TailoredResumeSchema.parse(tailoredResume);
    return NextResponse.json(validated);
  } catch (err: unknown) {
    const structured = err as { error?: boolean; code?: string; message?: string; details?: unknown };
    if (structured?.error) {
      return NextResponse.json(structured, { status: 422 });
    }
    return NextResponse.json(
      { error: true, code: "LLM_ERROR", message: "Failed to tailor resume" },
      { status: 422 },
    );
  }
}

