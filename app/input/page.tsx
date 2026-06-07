"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StepIndicator from "@/components/StepIndicator";
import ResumeInput from "@/components/ResumeInput";
import JDInput from "@/components/JDInput";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_RUN } from "@/lib/mockData";
import type { ResumeProfile } from "@/lib/schemas";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InputPage() {
  const router = useRouter();
  const store = useAppStore();
  const [resumeText, setResumeText] = useState(store.resumeRaw ?? "");
  const [jdText, setJdText] = useState(store.jdRaw ?? "");
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const canAnalyze = resumeText.trim().length > 0 && jdText.trim().length > 0;

  // Toast on error
  useEffect(() => {
    if (store.error) {
      toast.error(store.error);
      store.setError(null);
    }
  }, [store.error, store]);

  const handleAnalyze = async () => {
    store.setResume(resumeText);
    store.setJD(jdText);
    store.setStep("analysis");

    setParsing(true);
    try {
      // If resume was file-parsed, skip LLM parse call
      if (!store.resumeParsed) {
        await store.parseResume();
      }
      await store.parseJD();
      setParsing(false);

      if (store.error) return;

      setAnalyzing(true);
      await store.runAnalysis();
      setAnalyzing(false);

      if (store.error) return;

      router.push("/analysis");
    } catch {
      setParsing(false);
      setAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    setResumeText(MOCK_RUN.resumeRaw);
    setJdText(MOCK_RUN.jdRaw);
  };

  // File upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    const fileType = file.name.endsWith(".pdf") ? "pdf" : "docx" as const;
    setIsUploading(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const b64 = result.split(",")[1] ?? result;
          resolve(b64);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/parseResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: base64, fileType }),
      });

      let data: unknown;
      try {
        data = await res.json();
      } catch {
        toast.error("Server returned an invalid response. Try again or paste your resume as text.");
        return;
      }

      if (!res.ok) {
        const errData = data as { message?: string; details?: Array<{path?: unknown; message?: string}> };
        let msg = errData?.message ?? "Could not parse this file.";
        // Append Zod details for debugging
        if (errData?.details && Array.isArray(errData.details) && errData.details.length > 0) {
          const reasons = errData.details
            .map((d) => {
              const p = d.path;
              const path = Array.isArray(p) ? p.join(".") : "";
              return path ? `${path}: ${d.message}` : d.message;
            })
            .filter(Boolean)
            .join("; ");
          if (reasons) msg += ` (${reasons})`;
        }
        toast.error(msg, { duration: 8000 });
        return;
      }

      // Store parsed profile
      store.resumeParsed = data as ResumeProfile;
      // Store a UUID marker so parseResume() can detect file-uploaded state
      const fileMarker = `__FILE_UPLOADED__${Date.now()}`;
      store.setResume(fileMarker);
      setResumeText(fileMarker);

      const profile = data as { skills?: unknown[]; experience?: unknown[] };
      const skillCount = profile.skills?.length ?? 0;
      const roleCount = profile.experience?.length ?? 0;
      toast.success(`Parsed ${file.name} — ${skillCount} skills, ${roleCount} roles`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  }, [store]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <StepIndicator currentStep="input" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume & Job Description Input</h1>
          <p className="text-sm text-muted-foreground">
            Paste your resume and the job description below. Use the upload button to import PDF or DOCX text automatically.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleLoadSample}>
          <FileText className="h-4 w-4" />
          Load Sample
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ResumeInput
          value={resumeText}
          onChange={setResumeText}
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
        />
        <JDInput value={jdText} onChange={setJdText} />
      </div>

      <div className="mt-6 flex justify-center">
        <Button size="lg" className="gap-2" disabled={!canAnalyze || parsing || analyzing} onClick={handleAnalyze}>
          {parsing || analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {parsing ? "Parsing..." : "Analyzing..."}
            </>
          ) : (
            <>
              Analyze
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Parsed preview */}
      {(store.resumeParsed || store.jdParsed) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {store.resumeParsed && (
            <div className="rounded-lg border border-border bg-card p-4" aria-label="Parsed resume preview">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Parsed Resume
              </p>
              <p className="text-sm">
                <span className="font-medium">{store.resumeParsed.contact.name}</span> —{" "}
                {store.resumeParsed.experience.length} roles,{" "}
                {store.resumeParsed.skills.length} skills
              </p>
            </div>
          )}
          {store.jdParsed && (
            <div className="rounded-lg border border-border bg-card p-4" aria-label="Parsed job description preview">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Parsed JD
              </p>
              <p className="text-sm">
                <span className="font-medium">{store.jdParsed.jobTitle}</span>
                {store.jdParsed.company ? ` @ ${store.jdParsed.company}` : ""} —{" "}
                {store.jdParsed.requiredSkills.length} required skills
              </p>
            </div>
          )}
        </div>
      )}

      {(parsing || analyzing) && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      <div className="mt-8">
        <DisclaimerBanner message="Your resume data stays in your browser. Nothing is stored on a server." />
      </div>
    </main>
  );
}


