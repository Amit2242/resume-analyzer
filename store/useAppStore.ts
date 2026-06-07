// store/useAppStore.ts — Zustand global state with localStorage persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ResumeProfile,
  JobDescriptionProfile,
  MatchScore,
  TailoredResume,
  GapAnalysis,
} from "@/lib/schemas";
import {
  MOCK_RESUME,
  MOCK_JD,
  MOCK_ORIGINAL_SCORE,
  MOCK_TAILORED_RESUME,
  MOCK_TAILORED_SCORE,
  MOCK_GAP_ANALYSIS,
  MOCK_RUN,
} from "@/lib/mockData";

// ── State Shape ─────────────────────────────────────────────────
export interface AppState {
  // Input
  resumeRaw: string | null;
  resumeParsed: ResumeProfile | null;
  jdRaw: string | null;
  jdParsed: JobDescriptionProfile | null;

  // Analysis
  originalScore: MatchScore | null;
  gapAnalysis: GapAnalysis | null;
  isAnalyzing: boolean;

  // Tailoring
  tailoredResume: TailoredResume | null;
  tailoredScore: MatchScore | null;
  isTailoring: boolean;

  // Export
  isExporting: boolean;
  exportedPdfUrl: string | null;

  // UI
  currentStep: "input" | "analysis" | "editor" | "export";
  error: string | null;
  isLoading: boolean;

  // ── Actions ───────────────────────────────────────────────────
  setResume: (text: string) => void;
  setJD: (text: string) => void;
  setStep: (step: AppState["currentStep"]) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;

  // Async actions (stubs — logic added in later prompts)
  parseResume: () => Promise<void>;
  parseJD: () => Promise<void>;
  runAnalysis: () => Promise<void>;
  runTailoring: () => Promise<void>;
  exportPDF: () => Promise<void>;

  // Mock data loader
  loadMockData: () => void;
}

// ── Initial State ───────────────────────────────────────────────
const initialState = {
  resumeRaw: null,
  resumeParsed: null,
  jdRaw: null,
  jdParsed: null,
  originalScore: null,
  gapAnalysis: null,
  isAnalyzing: false,
  tailoredResume: null,
  tailoredScore: null,
  isTailoring: false,
  isExporting: false,
  exportedPdfUrl: null,
  currentStep: "input" as const,
  error: null,
  isLoading: false,
};

// ── Persisted Keys (whitelist) ──────────────────────────────────
// Only persist resume/JD content and results, not navigation state.
const persistKeys: (keyof AppState)[] = [
  "resumeRaw",
  "resumeParsed",
  "jdRaw",
  "jdParsed",
  "tailoredResume",
  "tailoredScore",
  "originalScore",
  "gapAnalysis",
  "exportedPdfUrl",
];

// ── Store ───────────────────────────────────────────────────────
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Sync Actions ──────────────────────────────────────────
      setResume: (text) => set({ resumeRaw: text }),
      setJD: (text) => set({ jdRaw: text }),

      setStep: (step) => set({ currentStep: step }),

      setError: (error) => set({ error }),

      clearAll: () => set({ ...initialState }),

      // ── Mock Data Loader ───────────────────────────────────
      loadMockData: () =>
        set({
          resumeRaw: MOCK_RUN.resumeRaw,
          resumeParsed: MOCK_RESUME,
          jdRaw: MOCK_RUN.jdRaw,
          jdParsed: MOCK_JD,
          originalScore: MOCK_ORIGINAL_SCORE,
          gapAnalysis: MOCK_GAP_ANALYSIS,
          tailoredResume: MOCK_TAILORED_RESUME,
          tailoredScore: MOCK_TAILORED_SCORE,
          currentStep: "analysis",
        }),

      // ── Async Actions (Real API Calls) ──────────────────────
      parseResume: async () => {
        const { resumeRaw } = get();
        if (!resumeRaw) return;
        // Skip if resume was uploaded as a file (already parsed via API)
        if (resumeRaw.startsWith("__FILE_UPLOADED__")) {
          console.log("[parseResume] Skipping — resume was parsed from file upload");
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/parse-resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: resumeRaw }),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ error: data.message ?? "Failed to parse resume", isLoading: false });
            return;
          }
          set({ resumeParsed: data, isLoading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Network error", isLoading: false });
        }
      },

      parseJD: async () => {
        const { jdRaw } = get();
        if (!jdRaw) return;
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/parse-jd", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: jdRaw }),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ error: data.message ?? "Failed to parse JD", isLoading: false });
            return;
          }
          set({ jdParsed: data, isLoading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Network error", isLoading: false });
        }
      },

      runAnalysis: async () => {
        const { resumeParsed, jdParsed } = get();
        if (!resumeParsed || !jdParsed) return;
        set({ isAnalyzing: true, error: null });
        try {
          const [scoreRes, gapRes] = await Promise.all([
            fetch("/api/score", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ resume: resumeParsed, jd: jdParsed }),
            }),
            fetch("/api/gap-analysis", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ resume: resumeParsed, jd: jdParsed }),
            }),
          ]);
          const [scoreData, gapData] = await Promise.all([scoreRes.json(), gapRes.json()]);
          if (!scoreRes.ok) {
            set({ error: scoreData.message ?? "Failed to score resume", isAnalyzing: false });
            return;
          }
          if (!gapRes.ok) {
            set({ error: gapData.message ?? "Failed to run gap analysis", isAnalyzing: false });
            return;
          }
          set({ originalScore: scoreData, gapAnalysis: gapData, isAnalyzing: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Network error", isAnalyzing: false });
        }
      },

      runTailoring: async () => {
        const { resumeParsed, jdParsed } = get();
        if (!resumeParsed || !jdParsed) return;
        set({ isTailoring: true, error: null });
        try {
          // 1. Tailor bullets
          const tailorRes = await fetch("/api/tailor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resume: resumeParsed, jd: jdParsed }),
          });
          const tailorData = await tailorRes.json();
          if (!tailorRes.ok) {
            set({ error: tailorData.message ?? "Failed to tailor resume", isTailoring: false });
            return;
          }

          // 2. Assemble final resume
          const assembleRes = await fetch("/api/assemble", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tailored: tailorData, jd: jdParsed }),
          });
          const assembled = await assembleRes.json();
          if (!assembleRes.ok) {
            set({ error: assembled.message ?? "Failed to assemble resume", isTailoring: false });
            return;
          }

          // 3. Re-score with tailored resume (convert to ResumeProfile shape)
          const tailoredProfile = {
            ...resumeParsed,
            summary: assembled.tailoredSummary ?? resumeParsed.summary,
            skills: assembled.tailoredSkills ?? resumeParsed.skills,
            experience: assembled.tailoredExperience?.map(
              (e: { company: string; title: string; bullets: { tailored: string }[] }) => ({
                company: e.company,
                title: e.title,
                bullets: e.bullets.map((b: { tailored: string }) => ({ text: b.tailored })),
              }),
            ) ?? resumeParsed.experience,
          };

          const scoreRes = await fetch("/api/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resume: tailoredProfile, jd: jdParsed }),
          });
          const scoreData = await scoreRes.json();
          if (!scoreRes.ok) {
            set({ error: scoreData.message ?? "Failed to score tailored resume", isTailoring: false });
            return;
          }

          set({
            tailoredResume: assembled,
            tailoredScore: scoreData,
            currentStep: "editor",
            isTailoring: false,
          });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Network error", isTailoring: false });
        }
      },

      exportPDF: async () => {
        set({ isExporting: true, error: null });
        try {
          const { resumeParsed, tailoredResume, originalScore, tailoredScore, gapAnalysis, jdParsed } = get();
          const res = await fetch("/api/export-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              original: resumeParsed,
              tailored: tailoredResume,
              originalScore,
              tailoredScore,
              gapAnalysis,
              jobTitle: jdParsed?.jobTitle ?? "",
              company: jdParsed?.company ?? "",
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ message: "Failed to generate PDF" }));
            set({ error: err.message ?? "Failed to generate PDF", isExporting: false });
            return;
          }
          // Trigger download
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `resume-shapeshifter-${(jdParsed?.jobTitle ?? "resume").toLowerCase().replace(/\s+/g, "-")}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          set({ isExporting: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Network error", isExporting: false });
        }
      },
    }),
    {
      name: "resume-shapeshifter-store",
      partialize: (state) =>
        Object.fromEntries(
          persistKeys.map((key) => [key, state[key]]),
        ) as Partial<AppState>,
    },
  ),
);

