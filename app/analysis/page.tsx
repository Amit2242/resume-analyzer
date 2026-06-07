"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StepIndicator from "@/components/StepIndicator";
import ScoreCard from "@/components/ScoreCard";
import GapAnalysis from "@/components/GapAnalysis";
import { useAppStore } from "@/store/useAppStore";
import { ArrowRight, Loader2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import type { JobDescriptionProfile } from "@/lib/schemas";

function JDSummary({ jd }: { jd: JobDescriptionProfile }) {
  return (
    <Card aria-label="Job description summary">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {jd.jobTitle} {jd.company ? `— ${jd.company}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Required Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {jd.requiredSkills.map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </div>
        {jd.preferredSkills && jd.preferredSkills.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Preferred</p>
            <div className="flex flex-wrap gap-1.5">
              {jd.preferredSkills.map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
          </div>
        )}
        {jd.tools && jd.tools.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Tools</p>
            <div className="flex flex-wrap gap-1.5">
              {jd.tools.map((t) => (
                <Badge key={t} variant="outline">{t}</Badge>
              ))}
            </div>
          </div>
        )}
        {jd.seniorityLevel && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Seniority:</span>
            <Badge>{jd.seniorityLevel}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalysisPage() {
  const router = useRouter();
  const store = useAppStore();
  const {
    resumeParsed,
    jdParsed,
    originalScore,
    gapAnalysis,
    isAnalyzing,
    isTailoring,
    error,
    loadMockData,
    runTailoring,
    setError,
  } = store;

  // Auto-load mock data if no data present (demo fallback)
  useEffect(() => {
    if (!resumeParsed || !jdParsed) {
      loadMockData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toast on error
  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error, setError]);

  // Loading state
  if (isAnalyzing || (!originalScore && !gapAnalysis)) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <StepIndicator currentStep="analysis" />
        <h1 className="mb-6 text-2xl font-bold">Resume Analysis</h1>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl lg:col-span-1" />
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!resumeParsed || !jdParsed || !originalScore || !gapAnalysis) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <StepIndicator currentStep="analysis" />
        <p className="text-center text-muted-foreground">No analysis data. Go back and upload a resume.</p>
      </main>
    );
  }

  const handleGenerate = async () => {
    await runTailoring();
    if (store.error) return;
    store.setStep("editor");
    router.push("/editor");
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8" aria-label="Resume analysis page">
      <StepIndicator currentStep="analysis" />

      <h1 className="mb-6 text-2xl font-bold">Resume Analysis</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ScoreCard score={originalScore} label="Original Match Score" variant="original" />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <JDSummary jd={jdParsed} />
          <GapAnalysis data={gapAnalysis} />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => router.push("/scorecard")}
        >
          <BarChart3 className="h-4 w-4" />
          View Full Scorecard
        </Button>
        <Button size="lg" className="gap-2" disabled={isTailoring} onClick={handleGenerate}>
          {isTailoring ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Tailoring...
            </>
          ) : (
            <>
              Generate Tailored Resume
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </main>
  );
}

