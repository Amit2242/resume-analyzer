// POST /api/parse-resume — Parse raw resume text or uploaded file into structured ResumeProfile

import { NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { ResumeProfileSchema } from "@/lib/schemas";
import { extractTextFromFile, sanitizeResumeText, truncateToTokenLimit } from "@/lib/parsing";
import { buildResumeParserPrompt } from "@/prompts";
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
    const body = await request.json() as {
      text?: string;
      fileBase64?: string;
      fileType?: "pdf" | "docx";
    };

    let rawText: string;

    if (body.fileBase64 && body.fileType) {
      // File upload path — decode base64 and extract text
      try {
        rawText = await extractTextFromFile(body.fileBase64, body.fileType);
      } catch (fileErr) {
        const fe = fileErr as { code?: string; message?: string };
        return NextResponse.json(
          { error: true, code: fe.code ?? "PARSE_ERROR", message: fe.message ?? "Failed to extract text from uploaded file." },
          { status: 422 },
        );
      }
    } else if (body.text) {
      rawText = sanitizeResumeText(body.text);
    } else {
      return NextResponse.json(
        { error: true, code: "PARSE_ERROR", message: "Provide either text or fileBase64+fileType." },
        { status: 422 },
      );
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: true, code: "PARSE_ERROR", message: "No text could be extracted. The resume appears empty." },
        { status: 422 },
      );
    }

    // ── Call LLM ───────────────────────────────────────────────
    const { systemPrompt, userPrompt } = buildResumeParserPrompt(truncateToTokenLimit(rawText));
    const result = await callLLM(systemPrompt, userPrompt, ResumeProfileSchema);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const structured = err as { error?: boolean; code?: string; message?: string; details?: unknown };
    if (structured?.error) {
      return NextResponse.json(structured, { status: 422 });
    }
    return NextResponse.json(
      { error: true, code: "LLM_ERROR", message: "Failed to parse resume" },
      { status: 422 },
    );
  }
}

