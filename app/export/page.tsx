"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StepIndicator from "@/components/StepIndicator";
import PDFExportButton from "@/components/PDFExportButton";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { useAppStore } from "@/store/useAppStore";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function ExportPage() {
  const router = useRouter();
  const store = useAppStore();
  const { tailoredResume, originalScore, tailoredScore, isExporting, error, setError, clearAll } = store;

  // Toast on error
  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error, setError]);

  if (!tailoredResume || !originalScore || !tailoredScore) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <StepIndicator currentStep="export" />
        <h1 className="mb-6 text-2xl font-bold">Export Your Resume</h1>
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <StepIndicator currentStep="export" />

      <h1 className="mb-6 text-2xl font-bold">Export Your Resume</h1>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Match Score Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-muted-foreground">{originalScore.overallScore}</p>
              <p className="text-xs text-muted-foreground">Original</p>
            </div>
            <ArrowUpRight className="h-8 w-8 text-primary" />
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{tailoredScore.overallScore}</p>
              <p className="text-xs text-muted-foreground">Tailored</p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            +{tailoredScore.overallScore - originalScore.overallScore} point improvement after tailoring
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <PDFExportButton label="Export Side-by-Side PDF" />
        <PDFExportButton label="Export Tailored Resume PDF" variant="outline" />
      </div>

      {isExporting && (
        <div className="mt-4 flex justify-center">
          <Skeleton className="h-10 w-48 rounded-md" />
        </div>
      )}

      <div className="mt-8">
        <DisclaimerBanner message="Review all content before submitting. Tailored bullets are suggestions — confirm they reflect your actual experience." />
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => {
            clearAll();
            router.push("/input");
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Start Over
        </Button>
      </div>
    </main>
  );
}


