// prompts/index.ts — Barrel export for all prompt builder functions

export { SYSTEM_GUARDRAILS } from "./system.prompt";
export { buildJDExtractionPrompt } from "./jd-extraction.prompt";
export { buildResumeParserPrompt } from "./resume-parser.prompt";
export { buildMatchScoringPrompt } from "./match-scoring.prompt";
export { buildBulletRewriterPrompt } from "./bullet-rewriter.prompt";
export { buildGapAnalysisPrompt } from "./gap-analysis.prompt";
export { buildResumeAssemblerPrompt } from "./resume-assembler.prompt";
