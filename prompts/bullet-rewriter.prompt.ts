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
      "\n\nRewrite these resume bullets to strongly align with the job description. " +
      "GOAL: Maximize keyword overlap without fabricating. Target 85-90% alignment. " +
      "Every bullet should incorporate at least 2-3 keywords or phrases from the JD. " +
      "Map each JD-required skill to at least one bullet if the user's work truthfully involved it. " +
      "For example, if the user 'collaborated with product teams' and the JD asks for 'Stakeholder Management', use that exact phrase. " +
      "If the user 'analyzed data' and the JD asks for 'Data Analysis', use that exact phrase. " +
      "Reframe technical work to highlight product thinking, stakeholder collaboration, and business impact. " +
      "NEVER fabricate experience. ONLY add JD terminology if it truthfully applies to the user's work. " +
      "Return ONLY a valid JSON array — no markdown, no backticks, no explanation. " +
      "confidence must be exactly 'high', 'medium', or 'low' (string, not boolean). " +
      "riskFlag must be a string or null (not a boolean). " +
      "keywordsAddressed must be an array of strings with at least 2 entries per bullet. " +
      "Each object must have ALL seven fields: " +
      "original, tailored, changeReason, keywordsAddressed[], " +
      "confidence, riskFlag. " +
      "If a bullet needs no change, return it unchanged with confidence 'high' " +
      "and changeReason 'No change needed'.",
    userPrompt: `Rewrite these bullets for the following JD.\n\nBULLETS:\n${JSON.stringify(bullets)}\n\nJD REQUIREMENTS:\n${JSON.stringify(jd)}`,
  };
}
