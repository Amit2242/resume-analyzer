"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import StepIndicator from "@/components/StepIndicator";
import SideBySideDiff from "@/components/SideBySideDiff";
import ScoreCard from "@/components/ScoreCard";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { useAppStore } from "@/store/useAppStore";
import {
  detectFabricatedClaims,
  computeTruthfulnessScore,
} from "@/lib/validation";
import { ArrowRight, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ResumeProfile, TailoredResume } from "@/lib/schemas";

export default function EditorPage() {
  const router = useRouter();
  const store = useAppStore();
  const {
    resumeParsed,
    tailoredResume,
    tailoredScore,
    originalScore,
    isTailoring,
    error,
    setError,
    setStep,
  } = store;

  const [confirmed, setConfirmed] = useState(false);

  // Toast on error
  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error, setError]);

  // Compute validation results from store data
  const validation = useMemo(() => {
    if (!resumeParsed || !tailoredResume) return null;
    return {
      fabrication: detectFabricatedClaims(
        resumeParsed as ResumeProfile,
        tailoredResume as TailoredResume,
      ),
      truthfulnessScore: computeTruthfulnessScore(
        tailoredResume as TailoredResume,
      ),
    };
  }, [resumeParsed, tailoredResume]);

  // Collect low-confidence bullets and risk-flagged bullets
  const lowConfBullets = useMemo(() => {
    if (!tailoredResume) return [];
    const result: { company: string; text: string }[] = [];
    for (const exp of tailoredResume.tailoredExperience) {
      for (const b of exp.bullets) {
        if (b.confidence === "low" || b.confidence === "medium") {
          result.push({ company: exp.company, text: b.tailored.slice(0, 100) });
        }
      }
    }
    return result;
  }, [tailoredResume]);

  const riskBullets = useMemo(() => {
    if (!tailoredResume) return [];
    const result: { company: string; text: string; flag: string }[] = [];
    for (const exp of tailoredResume.tailoredExperience) {
      for (const b of exp.bullets) {
        if (b.riskFlag && typeof b.riskFlag === "string") {
          result.push({ company: exp.company, text: b.tailored.slice(0, 100), flag: b.riskFlag });
        }
      }
    }
    return result;
  }, [tailoredResume]);

  const handleExport = () => {
    setStep("export");
    router.push("/export");
  };

  // Loading state
  if (isTailoring || !tailoredResume) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8" aria-label="Loading editor">
        <StepIndicator currentStep="editor" />
        <h1 className="mb-6 text-2xl font-bold">Side-by-Side Comparison</h1>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 rounded-xl" aria-hidden="true" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-60 rounded-xl" aria-hidden="true" />
            <Skeleton className="h-60 rounded-xl" aria-hidden="true" />
          </div>
          <Skeleton className="h-96 rounded-xl" aria-hidden="true" />
        </div>
      </main>
    );
  }

  if (!tailoredScore) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <StepIndicator currentStep="editor" />
        <p className="text-center text-muted-foreground">No tailored data. Run analysis first.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <StepIndicator currentStep="editor" />

      <div className="mb-4">
        <DisclaimerBanner
          message="Review all AI suggestions carefully before exporting. Low-confidence changes are flagged — verify them against your actual experience."
        />
      </div>

      <h1 className="mb-6 text-2xl font-bold">Side-by-Side Comparison</h1>

      {originalScore && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <ScoreCard
            score={originalScore}
            label="Original Score"
            variant="original"
          />
          <ScoreCard
            score={tailoredScore}
            label="Tailored Score"
            variant="tailored"
          />
        </div>
      )}

      <SideBySideDiff data={tailoredResume} />

      {/* ── Confirmation Panel ── */}
      <Card className="mt-8 border-yellow-600/30 bg-yellow-950/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-yellow-400" />
            Confirm Before Exporting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Truthfulness Score */}
          {validation && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {validation.truthfulnessScore}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Truthfulness Score
                </p>
                <p className="text-xs text-muted-foreground">
                  {validation.truthfulnessScore}% of rewrites are high-confidence
                  — meaning they closely match your original experience.
                </p>
              </div>
            </div>
          )}

          {/* Fabrication warnings */}
          {validation?.fabrication.hasFabrication && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <p className="flex items-center gap-1 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Potential unsupported claims detected
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                {validation.fabrication.flagged.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk-flagged bullets */}
          {riskBullets.length > 0 && (
            <div className="rounded-lg border border-yellow-600/30 bg-yellow-950/20 p-3">
              <p className="flex items-center gap-1 text-sm font-medium text-yellow-400">
                <AlertTriangle className="h-4 w-4" />
                Reviewed changes flagged with risk
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                {riskBullets.map((r, i) => (
                  <li key={i}>
                    <span className="font-medium">{r.company}:</span> {r.flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Low-confidence bullets */}
          {lowConfBullets.length > 0 && (
            <div className="rounded-lg border border-border bg-card/50 p-3">
              <p className="text-sm font-medium text-foreground">
                Low / Medium confidence rewrites ({lowConfBullets.length})
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                {lowConfBullets.map((l, i) => (
                  <li key={i}>
                    <span className="font-medium">{l.company}:</span> {l.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Checkbox */}
          <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent/50">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(v === true)}
              aria-label="I have reviewed all changes and confirm they accurately represent my experience"
              className="mt-0.5"
            />
            <span className="text-sm leading-relaxed text-muted-foreground">
              I have reviewed all changes and confirm they accurately represent
              my experience. I understand that the tailored content is based on
              my original resume and all suggestions require my verification
              before submission.
            </span>
          </label>

          {/* Export Button */}
          <Button
            size="lg"
            className="w-full gap-2"
            disabled={!confirmed}
            onClick={handleExport}
            aria-label="Proceed to export page"
          >
            {confirmed ? (
              <>
                Proceed to Export
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              "Confirm the checkbox above to continue"
            )}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}



