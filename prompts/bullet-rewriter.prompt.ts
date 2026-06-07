// prompts/bullet-rewriter.prompt.ts — Rewrite resume bullets to align with JD
import { SYSTEM_GUARDRAILS } from "./system.prompt";
import type { JobDescriptionProfile } from "@/lib/schemas";

export function buildBulletRewriterPrompt(
  bullets: string[],
  jd: JobDescriptionProfile,
): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      SYSTEM_GUARDRAILS +
      "\n\nRewrite these resume bullets to better match the job description. " +
      "NEVER fabricate experience. ONLY add JD terminology if it truthfully applies. " +
      "Return ONLY a valid JSON array — no markdown, no backticks, no explanation. " +
      "confidence must be exactly 'high', 'medium', or 'low' (string, not boolean). " +
      "riskFlag must be a string or null (not a boolean). " +
      "keywordsAddressed must be an array of strings. " +
      "Each object must have ALL seven fields: " +
      "original, tailored, changeReason, keywordsAddressed[], " +
      "confidence, riskFlag. " +
      "If a bullet needs no change, return it unchanged with confidence 'high' " +
      "and changeReason 'No change needed'.",
    userPrompt: `Rewrite these bullets for the following JD.\n\nBULLETS:\n${JSON.stringify(bullets)}\n\nJD REQUIREMENTS:\n${JSON.stringify(jd)}`,
  };
}
