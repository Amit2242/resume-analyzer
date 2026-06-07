// prompts/match-scoring.prompt.ts — Score resume against JD
import { SYSTEM_GUARDRAILS } from "./system.prompt";
import type { ResumeProfile, JobDescriptionProfile } from "@/lib/schemas";

export function buildMatchScoringPrompt(
  resume: ResumeProfile,
  jd: JobDescriptionProfile,
): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      SYSTEM_GUARDRAILS +
      "\n\nScore this resume against the job description. " +
      "Be honest and calibrated — do not be generous. " +
      "Return ONLY valid JSON — no markdown, no backticks, no explanation. " +
      "All scores must be numbers between 0 and 100. " +
      "criticalMissingRequirements must be an array of strings (use [] if none). " +
      "Match exactly: { overallScore, skillCoverageScore, " +
      "responsibilityAlignmentScore, keywordScore, seniorityScore, " +
      "criticalMissingRequirements[], explanation }.",
    userPrompt: `Score this resume against the JD.\n\nRESUME:\n${JSON.stringify(resume)}\n\nJOB DESCRIPTION:\n${JSON.stringify(jd)}`,
  };
}
