// prompts/jd-extraction.prompt.ts — Extract structured JD profile from raw text
import { SYSTEM_GUARDRAILS } from "./system.prompt";

export function buildJDExtractionPrompt(jdText: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      SYSTEM_GUARDRAILS +
      "\n\nExtract structured data from the job description. " +
      "Return ONLY valid JSON — no markdown, no backticks, no explanation. " +
      "All string values must be strings (not null, not boolean). " +
      "All array fields must be arrays (use [] if empty, not null). " +
      "Match exactly: " +
      "{ jobTitle, company, requiredSkills[], preferredSkills[], responsibilities[], " +
      "qualifications[], tools[], keywords[], seniorityLevel, domainSignals[] }.",
    userPrompt: `Extract structured data from this job description:\n\n${jdText}`,
  };
}
