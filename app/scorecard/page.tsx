"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import StepIndicator from "@/components/StepIndicator";
import ScoreGauge from "@/components/ScoreGauge";
import SectionCard from "@/components/SectionCard";
import QuantifiedBullets from "@/components/QuantifiedBullets";
import ContentCheck from "@/components/ContentCheck";
import { useAppStore } from "@/store/useAppStore";
import { ArrowRight, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { ResumeAnalysis } from "@/lib/schemas";
import { MOCK_RESUME } from "@/lib/mockData";

export default function ScorecardPage() {
  const router = useRouter();
  const store = useAppStore();
  const { resumeParsed } = store;
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      const resume = resumeParsed ?? MOCK_RESUME;
      try {
        const res = await fetch("/api/analyzeResume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message ?? "Analysis failed");
          toast.error(data.message ?? "Analysis failed");
        } else {
          setAnalysis(data);
        }
      } catch {
        setError("Network error. Check your connection.");
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };
    runAnalysis();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8" aria-label="Resume scorecard loading page">
        <StepIndicator currentStep="analysis" />
        <h1 className="mb-6 text-2xl font-bold">Resume Scorecard</h1>
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !analysis) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <StepIndicator currentStep="analysis" />
        <h1 className="mb-6 text-2xl font-bold">Resume Scorecard</h1>
        <div className="flex flex-col items-center gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-red-400" />
          <p className="text-sm text-muted-foreground">{error ?? "Failed to analyze resume"}</p>
          <Button type="button" variant="outline" onClick={() => { setLoading(true); setError(null); window.location.reload(); }}>
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  const categories = [
    { key: "content", label: "Content", weight: "40%" },
    { key: "atsEssentials", label: "ATS Essentials", weight: "25%" },
    { key: "hrRedFlags", label: "HR Red Flags", weight: "15%" },
    { key: "seniority", label: "Seniority", weight: "10%" },
    { key: "discrimination", label: "Discrimination", weight: "5%" },
    { key: "tailoring", label: "Tailoring", weight: "5%" },
  ] as const;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8" aria-label="Resume scorecard page">
      <StepIndicator currentStep="analysis" />

      <div className="mb-4 text-sm text-muted-foreground">
        This scorecard shows how your resume performs for recruiters and applicant tracking systems.
      </div>
      <div className="mb-6">
        <ScoreGauge analysis={analysis} />
      </div>

      {/* Section scores */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((cat) => (
          <SectionCard
            key={cat.key}
            section={analysis.sections[cat.key]}
          />
        ))}
      </div>

      {/* Detailed tabs */}
      <Tabs defaultValue="content" className="mb-8">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="quantify">Quantify Impact</TabsTrigger>
          <TabsTrigger value="spelling">Spelling & Grammar</TabsTrigger>
          <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <ContentCheck analysis={analysis} />
        </TabsContent>

        <TabsContent value="quantify" className="mt-4">
          <QuantifiedBullets analysis={analysis} />
        </TabsContent>

        <TabsContent value="spelling" className="mt-4">
          <ContentCheck analysis={analysis} />
        </TabsContent>

        <TabsContent value="suggestion" className="mt-4">
          <div className="flex items-start gap-3 rounded-xl border border-yellow-600/30 bg-yellow-950/20 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            <div className="text-sm leading-relaxed text-muted-foreground">
              {analysis.suggestion}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center gap-4">
        <Button type="button" size="lg" className="gap-2" onClick={() => { store.setStep("editor"); router.push("/editor"); }}>
          Continue to Tailoring
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}
