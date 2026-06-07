// lib/resumeAnalysis.ts — LLM-powered resume scorecard engine
import { callLLM } from "@/lib/llm";
import { ResumeAnalysisSchema, type ResumeProfile, type ResumeAnalysis } from "@/lib/schemas";
import { SYSTEM_GUARDRAILS } from "@/prompts/system.prompt";

const ANALYSIS_PROMPT = `You are an expert ATS resume analyzer. Analyze this resume and return a comprehensive scorecard as JSON.

Return ONLY valid JSON matching this EXACT schema:
{
  "overallScore": number (0-100),
  "totalIssues": number,
  "sections": {
    "content": { "name": "Content", "score": 0-100, "issues": [{ "name": string, "severity": "error"|"warning"|"info"|"success", "message": string, "suggestion"?: string, "count"?: number, "items"?: string[] }] },
    "atsEssentials": { "name": "ATS Essentials", "score": 0-100, "issues": [...] },
    "hrRedFlags": { "name": "HR Red Flags", "score": 0-100, "issues": [...] },
    "discrimination": { "name": "Discrimination", "score": 0-100, "issues": [...] },
    "seniority": { "name": "Seniority", "score": 0-100, "issues": [...] },
    "tailoring": { "name": "Tailoring", "score": 0-100, "issues": [...] }
  },
  "quantifiedBullets": [{ "original": string, "suggestion": string }],
  "atsParsed": { "rate": 0-100, "message": string },
  "spellingErrors": [{ "word": string, "suggestion": string }],
  "repeatedWords": [],
  "suggestion": string
}

SCORING RULES:
- overallScore: weighted average of all sections
- totalIssues: count of all issues with severity "error" or "warning"

CONTENT section (40% weight):
- Score: AtS parse rate, quantifying impact, repetition, spelling/grammar, bullet consistency
- Issues: missing quantifiers, spelling errors, repeated words, weak verbs, vague bullets
- quantifiedBullets: suggest how to add numbers/impact to bullets that lack them

ATS ESSENTIALS section (25% weight):
- Score: file format, sections present, contact info, design, header links
- Issues: missing sections, missing contact info, poor design, file format issues

HR RED FLAGS section (15% weight):
- Score: credibility, interview risks, peer benchmarking
- Issues: employment gaps, short tenures, lack of progression

DISCRIMINATION section (5% weight):
- Score: ageism, date bias
- Issues: Only flag obvious issues like photos, age, marital status

SENIORITY section (10% weight):
- Score: career progression, skill evidence, leadership signals
- Issues: lack of progression, insufficient evidence of skills

TAILORING section (5% weight):
- Score: how well the resume can be tailored
- Issues: generic summary, lack of targeted keywords

Be honest and conservative. Don't inflate scores.`;

export async function analyzeResume(resume: ResumeProfile): Promise<ResumeAnalysis> {
  const resumeText = JSON.stringify(resume, null, 2);
  const prompt = `Analyze this resume:\n\n${resumeText}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await callLLM<any>(SYSTEM_GUARDRAILS + "\n\n" + ANALYSIS_PROMPT, prompt, ResumeAnalysisSchema, {
    maxTokens: 4096,
    temperature: 0.1,
  });

  return {
    ...result,
    quantifiedBullets: result.quantifiedBullets ?? [],
    spellingErrors: result.spellingErrors ?? [],
    repeatedWords: result.repeatedWords ?? [],
    sections: {
      content: { ...result.sections.content, issues: result.sections.content.issues ?? [] },
      atsEssentials: { ...result.sections.atsEssentials, issues: result.sections.atsEssentials.issues ?? [] },
      hrRedFlags: { ...result.sections.hrRedFlags, issues: result.sections.hrRedFlags.issues ?? [] },
      discrimination: { ...result.sections.discrimination, issues: result.sections.discrimination.issues ?? [] },
      seniority: { ...result.sections.seniority, issues: result.sections.seniority.issues ?? [] },
      tailoring: { ...result.sections.tailoring, issues: result.sections.tailoring.issues ?? [] },
    },
  } as ResumeAnalysis;
}
