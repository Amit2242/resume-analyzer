"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumeAnalysis } from "@/lib/schemas";
import { Sparkles, ArrowRight } from "lucide-react";

export default function QuantifiedBullets({ analysis }: { analysis: ResumeAnalysis }) {
  if (!analysis.quantifiedBullets || analysis.quantifiedBullets.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <CardTitle className="text-sm">Quantify Impact</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          A good resume shows the impact you&apos;ve made. Here are suggestions to add quantifiable achievements.
        </p>
        {analysis.quantifiedBullets.map((item, i) => (
          <div key={i} className="space-y-1.5 rounded-lg border border-border bg-card/50 p-3">
            <p className="text-xs text-muted-foreground line-through">{item.original}</p>
            <div className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              <p className="text-xs">{item.suggestion}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
