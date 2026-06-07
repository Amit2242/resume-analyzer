// lib/schemas.ts — Zod schemas for all domain objects
// See architecture.md §4 for full schema definitions

import { z } from "zod";

// ── Resume Profile ──────────────────────────────────────────────

export const ContactSchema = z.object({
  name: z.string().catch("").optional(),
  email: z.string().catch("").optional(),
  phone: z.string().catch("").optional(),
  location: z.string().catch("").optional(),
  linkedin: z.string().catch("").optional(),
  website: z.string().catch("").optional(),
});

export const ExperienceBulletSchema = z.object({ text: z.string().catch("") });

export const ExperienceSchema = z.object({
  company: z.string().catch(""),
  title: z.string().catch(""),
  startDate: z.string().catch("").optional(),
  endDate: z.string().catch("").optional(),
  bullets: z.array(ExperienceBulletSchema).default([]),
});

export const ProjectSchema = z.object({
  name: z.string().catch(""),
  description: z.string().catch("").optional(),
  bullets: z.array(z.string()).optional(),
});

export const EducationSchema = z.object({
  institution: z.string().catch(""),
  degree: z.string().catch(""),
  field: z.string().catch("").optional(),
  startDate: z.string().catch("").optional(),
  endDate: z.string().catch("").optional(),
});

// ── Inferred Types ──────────────────────────────────────────────
export type Contact = z.infer<typeof ContactSchema>;
export type ExperienceBullet = z.infer<typeof ExperienceBulletSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Education = z.infer<typeof EducationSchema>;

export const ResumeProfileSchema = z.object({
  contact: ContactSchema,
  summary: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceSchema),
  projects: z.array(ProjectSchema).optional(),
  education: z.array(EducationSchema).optional(),
  certifications: z.array(z.string()).optional(),
});

export type ResumeProfile = z.infer<typeof ResumeProfileSchema>;

// ── JD Profile ──────────────────────────────────────────────────
export const JobDescriptionProfileSchema = z.object({
  jobTitle: z.string(),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()),
  qualifications: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  keywords: z.array(z.string()),
  seniorityLevel: z.string().optional(),
  domainSignals: z.array(z.string()).optional(),
});

export type JobDescriptionProfile = z.infer<typeof JobDescriptionProfileSchema>;

// ── Match Score ─────────────────────────────────────────────────
export const MatchScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  skillCoverageScore: z.number().min(0).max(100),
  responsibilityAlignmentScore: z.number().min(0).max(100),
  keywordScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  criticalMissingRequirements: z.array(z.string()),
  explanation: z.string(),
});

export type MatchScore = z.infer<typeof MatchScoreSchema>;

// ── Tailored Resume ─────────────────────────────────────────────
export const BulletRewriteSchema = z.object({
  original: z.string(),
  tailored: z.string(),
  changeReason: z.string(),
  keywordsAddressed: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
  riskFlag: z.union([z.string(), z.boolean(), z.null()]).optional(),
});

export const TailoredExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  bullets: z.array(BulletRewriteSchema),
});

export const TailoredResumeSchema = z.object({
  tailoredSummary: z.string().optional(),
  tailoredSkills: z.array(z.string()),
  tailoredExperience: z.array(TailoredExperienceSchema),
  bulletMetadata: z.array(BulletRewriteSchema).optional(),
});

export type BulletRewrite = z.infer<typeof BulletRewriteSchema>;
export type TailoredExperienceEntry = z.infer<typeof TailoredExperienceSchema>;
export type TailoredResume = z.infer<typeof TailoredResumeSchema>;

// ── Gap Analysis ────────────────────────────────────────────────
export const ResumeGapSchema = z.object({
  name: z.string(),
  importance: z.enum(["high", "medium", "low"]),
  jdEvidence: z.string(),
  resumeEvidence: z.string().optional(),
  suggestedAction: z.string(),
  canSafelyAdd: z.boolean(),
});

export const GapAnalysisSchema = z.object({
  gaps: z.array(ResumeGapSchema),
});

export type ResumeGap = z.infer<typeof ResumeGapSchema>;
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;

// ── Tailoring Run (Aggregate) ───────────────────────────────────
export const TailoringRunSchema = z.object({
  id: z.string(),
  resume: ResumeProfileSchema,
  jobDescription: JobDescriptionProfileSchema,
  originalScore: MatchScoreSchema,
  tailoredResume: TailoredResumeSchema.optional(),
  tailoredScore: MatchScoreSchema.optional(),
  gapAnalysis: GapAnalysisSchema.optional(),
  createdAt: z.string(),
});

export type TailoringRun = z.infer<typeof TailoringRunSchema>;

// ── API Error ───────────────────────────────────────────────────
export const APIErrorSchema = z.object({
  error: z.literal(true),
  code: z.enum([
    "PARSE_ERROR",
    "VALIDATION_ERROR",
    "LLM_ERROR",
    "PDF_ERROR",
    "RATE_LIMIT",
  ]),
  message: z.string(),
  details: z.unknown().optional(),
});

export type APIError = z.infer<typeof APIErrorSchema>;
