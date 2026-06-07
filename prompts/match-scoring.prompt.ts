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
      "For the TAILORED score: assume the resume has been rewritten to maximize alignment. " +
      "Give credit for every JD keyword or skill that truthfully appears anywhere in the resume — skills section, bullets, or summary. " +
      "If the resume mentions a concept even once (e.g., 'analyzed metrics'), count it as matching that JD requirement. " +
      "Aim for a tailored score of 85-90 when the resume has transferable skills. " +
      "Be fair — recognize that truthful reframing of existing experience can close most gaps. " +
      "Only mark a requirement as critically missing if it's completely absent without any transferable equivalent. " +
      "Return ONLY valid JSON — no markdown, no backticks, no explanation. " +
      "All scores must be numbers between 0 and 100. " +
      "criticalMissingRequirements must be an array of strings (use [] if none). " +
      "Match exactly: { overallScore, skillCoverageScore, " +
      "responsibilityAlignmentScore, keywordScore, seniorityScore, " +
      "criticalMissingRequirements[], explanation }.",
    userPrompt: `Score this resume against the JD. Focus on transferable skills and potential alignment.\n\nRESUME:\n${JSON.stringify(resume)}\n\nJOB DESCRIPTION:\n${JSON.stringify(jd)}`,
  };
}
