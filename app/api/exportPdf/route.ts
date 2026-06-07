// POST /api/export-pdf — Generate comparison PDF and return as downloadable file

import { NextResponse } from "next/server";
import { generateComparisonPDF } from "@/lib/pdf";
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
      original: unknown;
      tailored: unknown;
      originalScore: unknown;
      tailoredScore: unknown;
      gapAnalysis: unknown;
      jobTitle: string;
      company: string;
    };

    if (!body.original || !body.tailored || !body.originalScore || !body.tailoredScore || !body.gapAnalysis) {
      return NextResponse.json(
        { error: true, code: "PARSE_ERROR", message: "Missing required fields: original, tailored, scores, gapAnalysis." },
        { status: 422 },
      );
    }

    // ── Generate PDF ──────────────────────────────────────────
    const pdfBuffer = await generateComparisonPDF({
      original: body.original as never,
      tailored: body.tailored as never,
      originalScore: body.originalScore as never,
      tailoredScore: body.tailoredScore as never,
      gapAnalysis: body.gapAnalysis as never,
      jobTitle: body.jobTitle ?? "Position",
      company: body.company ?? "",
    });

    const sanitizedTitle = (body.jobTitle ?? "resume")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "resume";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-shapeshifter-${sanitizedTitle}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err: unknown) {
    const structured = err as { error?: boolean; code?: string; message?: string };
    if (structured?.error) {
      return NextResponse.json(structured, { status: 422 });
    }
    return NextResponse.json(
      { error: true, code: "PDF_ERROR", message: "Failed to generate PDF" },
      { status: 422 },
    );
  }
}

