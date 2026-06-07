// lib/scoring.ts — Non-LLM scoring helpers (keyword overlap for fast pre-scoring)

/**
 * Compute simple keyword overlap between resume text and JD keywords.
 * Lowercases everything for case-insensitive matching.
 *
 * @returns { matched, missing, score } — score is 0–100.
 */
export function computeKeywordOverlap(
  resumeText: string,
  jdKeywords: string[],
): { matched: string[]; missing: string[]; score: number } {
  if (jdKeywords.length === 0) {
    return { matched: [], missing: [], score: 100 };
  }

  const resumeLower = resumeText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of jdKeywords) {
    if (resumeLower.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const score = Math.round((matched.length / jdKeywords.length) * 100);
  return { matched, missing, score };
}
