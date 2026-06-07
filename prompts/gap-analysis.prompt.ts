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
      "\n\nIdentify gaps between this resume and job description. " +
      "Return ONLY valid JSON — no markdown, no backticks, no explanation. " +
      "importance must be exactly 'high', 'medium', or 'low'. " +
      "canSafelyAdd must be a boolean (true or false, not a string). " +
      "Match exactly: { gaps: [{ name, importance, " +
      "jdEvidence, resumeEvidence, suggestedAction, canSafelyAdd }] }.",
    userPrompt: `Identify gaps.\n\nRESUME:\n${JSON.stringify(resume)}\n\nJD:\n${JSON.stringify(jd)}`,
  };
}
