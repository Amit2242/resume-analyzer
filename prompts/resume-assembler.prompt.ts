// prompts/resume-assembler.prompt.ts — Assemble tailored parts into final resume
import { SYSTEM_GUARDRAILS } from "./system.prompt";
import type { TailoredResume, JobDescriptionProfile } from "@/lib/schemas";

export function buildResumeAssemblerPrompt(
  tailored: TailoredResume,
  jd: JobDescriptionProfile,
): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      SYSTEM_GUARDRAILS +
      "\n\nAssemble a final tailored resume from these rewritten sections. " +
      "Reorder skills to put the most JD-relevant ones first. " +
      "Polish the summary to align with the role without adding unsupported claims. " +
      "Return ONLY valid JSON — no markdown, no backticks, no explanation. " +
      "Every bullet in tailoredExperience must be an object, not a string. " +
      "Each bullet object must have: original, tailored, changeReason, " +
      "keywordsAddressed[], confidence ('high'|'medium'|'low'), riskFlag (string|null). " +
      "Match exactly: { tailoredSummary, tailoredSkills[], " +
      "tailoredExperience[{company, title, " +
      "bullets[{original, tailored, changeReason, keywordsAddressed[], confidence, riskFlag}]}] }.",
    userPrompt: `Assemble the final resume.\n\nTAILORED SECTIONS:\n${JSON.stringify(tailored)}\n\nJD:\n${JSON.stringify(jd)}`,
  };
}
