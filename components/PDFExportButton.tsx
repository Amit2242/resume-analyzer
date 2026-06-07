"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";

interface PDFExportButtonProps {
  label: string;
  variant?: "default" | "outline";
}

export default function PDFExportButton({ label, variant = "default" }: PDFExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const store = useAppStore();
  const { resumeParsed, tailoredResume, originalScore, tailoredScore, gapAnalysis, jdParsed } = store;

  const handleClick = async () => {
    if (!resumeParsed || !tailoredResume || !originalScore || !tailoredScore || !gapAnalysis) {
      toast.error("Missing data. Run the full tailoring flow first.");
      return;
    }

    setExporting(true);
    store.setError(null);

    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original: resumeParsed,
          tailored: tailoredResume,
          originalScore,
          tailoredScore,
          gapAnalysis,
          jobTitle: jdParsed?.jobTitle ?? "Position",
          company: jdParsed?.company ?? "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to generate PDF" }));
        toast.error(err.message ?? "Failed to generate PDF");
        setExporting(false);
        return;
      }

      // Receive as blob and trigger download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-shapeshifter-${(jdParsed?.jobTitle ?? "resume").toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!");
    } catch {
      toast.error("Network error while generating PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button variant={variant} size="lg" className="gap-2" onClick={handleClick} disabled={exporting}>
      {exporting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileDown className="h-5 w-5" />
          {label}
        </>
      )}
    </Button>
  );
}


