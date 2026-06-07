// lib/pdf.ts — PDF generation service via Puppeteer

import puppeteer from "puppeteer";
import type { ResumeProfile, MatchScore, GapAnalysis, TailoredResume } from "@/lib/schemas";

// Detect if we're on Vercel serverless
const IS_VERCEL = process.env.VERCEL === "1";

async function getBrowser() {
  if (IS_VERCEL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const chromium = require("@sparticuz/chromium");
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

function importanceColor(importance: string): string {
  switch (importance) {
    case "high": return "#ef4444";
    case "medium": return "#f59e0b";
    case "low": return "#6b7280";
    default: return "#6b7280";
  }
}

function confidenceBadge(confidence: string): string {
  switch (confidence) {
    case "high": return `<span style="background:#22c55e;color:#fff;padding:1px 8px;border-radius:4px;font-size:9px;font-weight:600;">high</span>`;
    case "medium": return `<span style="background:#f59e0b;color:#fff;padding:1px 8px;border-radius:4px;font-size:9px;font-weight:600;">medium</span>`;
    case "low": return `<span style="background:#ef4444;color:#fff;padding:1px 8px;border-radius:4px;font-size:9px;font-weight:600;">low</span>`;
    default: return "";
  }
}

function scoreColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function buildHTML(data: {
  original: ResumeProfile;
  tailored: TailoredResume;
  originalScore: MatchScore;
  tailoredScore: MatchScore;
  gapAnalysis: GapAnalysis;
  jobTitle: string;
  company: string;
}): string {
  const { original, tailored, originalScore, tailoredScore, gapAnalysis, jobTitle, company } = data;
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const candidateName = original.contact?.name ?? "Candidate";

  const scoreBox = (label: string, score: number, color: string) => `
    <div style="flex:1;border:2px solid ${color};border-radius:8px;padding:12px;text-align:center;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">${label}</div>
      <div style="font-size:36px;font-weight:700;color:${color};">${score}</div>
      <div style="font-size:10px;color:#9ca3af;">/ 100</div>
    </div>`;

  let experienceRows = "";
  for (const exp of tailored.tailoredExperience) {
    const origExp = original.experience.find((e) => e.company === exp.company && e.title === exp.title);

    experienceRows += `
      <tr style="background:#f3f4f6;">
        <td colspan="2" style="padding:8px 4px;font-weight:600;font-size:13px;">${esc(exp.title)} — ${esc(exp.company)}</td>
      </tr>`;

    for (let i = 0; i < exp.bullets.length; i++) {
      const bullet = exp.bullets[i];
      const origText = origExp?.bullets[i]?.text ?? bullet.original;
      const isChanged = origText !== bullet.tailored;

      experienceRows += `
        <tr>
          <td style="width:50%;padding:6px 4px;vertical-align:top;border-bottom:1px solid #e5e7eb;">
            <div style="font-size:10px;color:#9ca3af;margin-bottom:2px;">Original</div>
            <div style="font-size:11px;line-height:1.4;">${esc(origText)}</div>
          </td>
          <td style="width:50%;padding:6px 4px;vertical-align:top;border-bottom:1px solid #e5e7eb;${isChanged ? "background:#fef9c3;" : ""}">
            <div style="font-size:10px;color:#9ca3af;margin-bottom:2px;">Tailored</div>
            <div style="font-size:11px;line-height:1.4;">${esc(bullet.tailored)}</div>
            ${bullet.changeReason ? `<div style="font-size:9px;color:#9ca3af;font-style:italic;margin-top:2px;">${esc(bullet.changeReason)}</div>` : ""}
            <div style="margin-top:3px;display:flex;gap:4px;flex-wrap:wrap;">
              ${confidenceBadge(bullet.confidence)}
              ${bullet.keywordsAddressed.map((kw) =>
                `<span style="background:#e5e7eb;color:#374151;padding:1px 6px;border-radius:3px;font-size:8px;">${esc(kw)}</span>`
              ).join("")}
            </div>
            ${bullet.riskFlag && typeof bullet.riskFlag === "string"
              ? `<div style="font-size:9px;color:#ef4444;margin-top:2px;">⚠ ${esc(bullet.riskFlag)}</div>`
              : ""}
          </td>
        </tr>`;
    }
  }

  const gapRows = gapAnalysis.gaps.map((gap) => `
    <tr>
      <td style="padding:6px 4px;font-size:11px;font-weight:500;">${esc(gap.name)}</td>
      <td style="padding:6px 4px;font-size:11px;"><span style="background:${importanceColor(gap.importance)};color:#fff;padding:1px 8px;border-radius:4px;font-size:9px;font-weight:600;">${gap.importance}</span></td>
      <td style="padding:6px 4px;font-size:10px;color:#6b7280;">${esc(gap.jdEvidence)}</td>
      <td style="padding:6px 4px;font-size:10px;">${esc(gap.suggestedAction)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Resume Shapeshifter — Comparison</title>
<style>
  @page { margin: 20mm 15mm 20mm 15mm; }
  body { font-family: 'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #111827; font-size: 12px; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 4px; }
  .page-break { page-break-after: always; }
</style>
</head>
<body>

  <div style="border-bottom:2px solid #3b82f6;padding-bottom:12px;margin-bottom:20px;">
    <div style="font-size:18px;font-weight:700;color:#111827;">${esc(jobTitle)}${company ? ` — ${esc(company)}` : ""}</div>
    <div style="font-size:10px;color:#9ca3af;">Generated by Resume Shapeshifter — ${date} — ${esc(candidateName)}</div>
  </div>

  <div style="display:flex;gap:16px;margin-bottom:24px;">
    ${scoreBox("Original Match Score", originalScore.overallScore, scoreColor(originalScore.overallScore))}
    ${scoreBox("Tailored Match Score", tailoredScore.overallScore, scoreColor(tailoredScore.overallScore))}
  </div>

  <div style="margin-bottom:20px;">
    <div style="font-size:12px;line-height:1.5;color:#6b7280;">
      <strong style="color:#111827;">Original:</strong> ${esc(originalScore.explanation)}
    </div>
    <div style="font-size:12px;line-height:1.5;color:#6b7280;margin-top:4px;">
      <strong style="color:#111827;">Tailored:</strong> ${esc(tailoredScore.explanation)}
    </div>
  </div>

  <div style="margin-bottom:24px;">
    <h2 style="font-size:14px;font-weight:700;margin:0 0 8px 0;padding-bottom:4px;border-bottom:1px solid #e5e7eb;">Bullet Comparison</h2>
    <table>
      <thead>
        <tr style="background:#f9fafb;">
          <th style="width:50%;padding:8px 4px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;">Original</th>
          <th style="width:50%;padding:8px 4px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;">Tailored <span style="font-weight:400;text-transform:none;">(yellow = changed)</span></th>
        </tr>
      </thead>
      <tbody>${experienceRows}</tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <div style="margin-bottom:24px;">
    <h2 style="font-size:14px;font-weight:700;margin:0 0 8px 0;padding-bottom:4px;border-bottom:1px solid #e5e7eb;">Skills Gap Analysis</h2>
    <table>
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 4px;text-align:left;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;">Gap</th>
          <th style="padding:8px 4px;text-align:left;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;">Importance</th>
          <th style="padding:8px 4px;text-align:left;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;">JD Evidence</th>
          <th style="padding:8px 4px;text-align:left;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;">Suggested Action</th>
        </tr>
      </thead>
      <tbody>${gapRows}</tbody>
    </table>
  </div>

  <div style="margin-top:32px;padding:12px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;">
    <div style="font-size:11px;font-weight:600;color:#92400e;margin-bottom:4px;">⚠ Review Required</div>
    <div style="font-size:10px;color:#92400e;line-height:1.5;">
      This resume was tailored using AI. All content is based solely on the original resume. No experience has been fabricated. Review all suggestions before submitting.
    </div>
  </div>

  <div style="margin-top:16px;padding-top:8px;border-top:1px solid #e5e7eb;text-align:center;font-size:9px;color:#9ca3af;">
    Generated by Resume Shapeshifter — Review all AI suggestions before submitting.
  </div>

</body></html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function generateComparisonPDF(data: {
  original: ResumeProfile;
  tailored: TailoredResume;
  originalScore: MatchScore;
  tailoredScore: MatchScore;
  gapAnalysis: GapAnalysis;
  jobTitle: string;
  company: string;
}): Promise<Uint8Array> {
  const html = buildHTML(data);
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      printBackground: true,
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function generateTailoredResumePDF(
  _data: Record<string, unknown>,
): Promise<Buffer> {
  throw new Error("Tailored resume PDF generation coming in a future phase.");
}

