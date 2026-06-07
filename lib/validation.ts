// lib/validation.ts — Truthfulness guardrails & post-LLM validation

import type { ZodSchema } from "zod";
import type { ResumeProfile, TailoredResume } from "@/lib/schemas";

/**
 * Build a set of proper nouns and key terms from the original resume.
 */
function buildResumeWordSet(original: ResumeProfile): Set<string> {
  const words = new Set<string>();

  // Contact
  if (original.contact?.name) addTokens(words, original.contact.name);
  if (original.contact?.email) addTokens(words, original.contact.email);
  if (original.contact?.location) addTokens(words, original.contact.location);

  // Summary
  if (original.summary) addTokens(words, original.summary);

  // Skills
  for (const skill of original.skills ?? []) {
    addTokens(words, skill);
  }

  // Experience
  for (const exp of original.experience ?? []) {
    addTokens(words, exp.company);
    addTokens(words, exp.title);
    for (const b of exp.bullets ?? []) addTokens(words, b.text);
  }

  // Projects
  for (const p of original.projects ?? []) {
    addTokens(words, p.name);
    if (p.description) addTokens(words, p.description);
    for (const b of p.bullets ?? []) addTokens(words, b);
  }

  // Education
  for (const edu of original.education ?? []) {
    addTokens(words, edu.institution);
    addTokens(words, edu.degree);
    if (edu.field) addTokens(words, edu.field);
  }

  // Certifications
  for (const cert of original.certifications ?? []) {
    addTokens(words, cert);
  }

  return words;
}

function addTokens(set: Set<string>, text: string): void {
  const tokens = text
    .toLowerCase()
    .split(/[\s,;:.!?()\-/]+/)
    .filter((t) => t.length > 2);
  for (const t of tokens) set.add(t);
}

/**
 * Detect fabricated claims in the tailored resume.
 * Returns a list of flagged bullet texts with reasons.
 */
export function detectFabricatedClaims(
  original: ResumeProfile,
  tailored: TailoredResume,
): { hasFabrication: boolean; flagged: string[] } {
  const wordSet = buildResumeWordSet(original);
  const flagged: string[] = [];

  // Known proper noun patterns that should exist in the original
  const knownTech = [
    "react", "typescript", "javascript", "python", "node", "express",
    "postgresql", "sql", "mongodb", "docker", "kubernetes", "aws",
    "gcp", "azure", "git", "tailwind", "graphql", "rest", "api",
    "html", "css", "figma", "jira", "excel", "tableau", "mixpanel",
    "amplitude", "zeplin",
  ];

  for (const exp of tailored.tailoredExperience) {
    for (const bullet of exp.bullets) {
      const lowerText = bullet.tailored.toLowerCase();
      const lowerOrig = bullet.original.toLowerCase();

      // Extract capitalized words (potential proper nouns)
      const properNouns = bullet.tailored.match(/\b[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})*\b/g) ?? [];

      for (const noun of properNouns) {
        const lowerNoun = noun.toLowerCase();

        // Skip common English words, days, months
        if (["The", "This", "That", "With", "From", "Each", "Both", "Most",
          "January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December",
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
          "Senior", "Junior", "Lead", "Principal", "Software", "Engineer",
          "Manager", "Product", "Design", "Data", "Analysis", "Team",
          "Role", "Position",
        ].includes(noun)) continue;

        // Skip known tech
        if (knownTech.includes(lowerNoun)) continue;

        // Check if it exists in original
        if (!wordSet.has(lowerNoun)) {
          flagged.push(
            `"${bullet.tailored.slice(0, 80)}..." — mentions "${noun}" not found in original resume`,
          );
        }
      }
    }
  }

  return { hasFabrication: flagged.length > 0, flagged };
}

/**
 * Compute a truthfulness score based on confidence levels.
 * Returns a percentage: high-confidence bullets / total bullets * 100
 */
export function computeTruthfulnessScore(tailored: TailoredResume): number {
  let total = 0;
  let high = 0;

  for (const exp of tailored.tailoredExperience) {
    for (const bullet of exp.bullets) {
      total++;
      if (bullet.confidence === "high") high++;
    }
  }

  if (total === 0) return 100;
  return Math.round((high / total) * 100);
}

/**
 * Validate an LLM response string against a Zod schema.
 */
export function validateLLMResponse<T>(
  raw: string,
  schema: ZodSchema<T>,
): { success: true; data: T } | { success: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Try extracting from markdown fences
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match?.[1]) {
      try {
        parsed = JSON.parse(match[1].trim());
      } catch {
        return { success: false, error: "Failed to parse JSON from LLM response" };
      }
    } else {
      return { success: false, error: "Failed to parse JSON from LLM response" };
    }
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    return { success: false, error: `Schema validation failed: ${result.error.issues.map((i) => i.message).join("; ")}` };
  }

  return { success: true, data: result.data };
}

