// prompts/resume-parser.prompt.ts — Parse raw resume text into structured ResumeProfile
import { SYSTEM_GUARDRAILS } from "./system.prompt";

export function buildResumeParserPrompt(resumeText: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      SYSTEM_GUARDRAILS +
      "\n\nParse the resume into structured JSON. " +
      "Return ONLY valid JSON — no markdown, no backticks, no explanation. " +
      "All string values must be strings (use \"\" for empty, not null). " +
      "All array fields must be arrays (use [] if empty). " +
      "Match exactly: " +
      "{ contact{name,email,phone,location,linkedin,website}, summary, skills[], " +
      "experience[{company,title,startDate,endDate,bullets[{text}]}], " +
      "projects[{name,description,bullets[]}], " +
      "education[{institution,degree,field,startDate,endDate}], certifications[] }.",
    userPrompt: `Parse this resume into structured JSON:\n\n${resumeText}`,
  };
}
