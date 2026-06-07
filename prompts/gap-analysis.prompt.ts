// prompts/gap-analysis.prompt.ts — Identify missing skills and weak areas
import { SYSTEM_GUARDRAILS } from "./system.prompt";
import type { ResumeProfile, JobDescriptionProfile } from "@/lib/schemas";

export function buildGapAnalysisPrompt(
  resume: ResumeProfile,
  jd: JobDescriptionProfile,
): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      SYSTEM_GUARDRAILS +
      "\n\nIdentify meaningful skill gaps between this resume and job description. " +
      "IMPORTANT: Return HIGH-LEVEL skill gaps (like 'No SQL experience', 'Missing project management background'), NOT individual words. " +
      "Do NOT list every word from the JD as a separate gap. " +
      "Focus only on actual missing qualifications, skills, tools, or experience areas. " +
      "Return ONLY valid JSON — no markdown, no backticks, no explanation. " +
      "importance must be exactly 'high', 'medium', or 'low'. " +
      "canSafelyAdd must be a boolean (true or false, not a string). " +
      "Match exactly: { gaps: [{ name, importance, " +
      "jdEvidence, resumeEvidence, suggestedAction, canSafelyAdd }] }. " +
      "Aim for 3-6 gaps total — one per meaningful missing qualification.",
    userPrompt: `Identify gaps.\n\nRESUME:\n${JSON.stringify(resume)}\n\nJD:\n${JSON.stringify(jd)}`,
  };
}
