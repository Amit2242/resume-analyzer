"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumeAnalysis } from "@/lib/schemas";
import { AlertTriangle, CheckCircle, Type, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ContentCheck({ analysis }: { analysis: ResumeAnalysis }) {
  const content = analysis.sections.content;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          Content Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Spelling errors */}
        {analysis.spellingErrors.length > 0 && (
          <div className="space-y-2">
            <p className="flex items-center gap-1 text-xs font-medium text-red-400">
              <AlertTriangle className="h-3 w-3" />
              Spelling &amp; Grammar
            </p>
            <p className="text-xs text-muted-foreground">We found the following spelling mistakes:</p>
            <div className="space-y-1">
              {analysis.spellingErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge variant="destructive" className="text-[10px]">{err.word}</Badge>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-400">{err.suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Repeated words */}
        {analysis.repeatedWords.length > 0 && (
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-xs font-medium text-yellow-400">
              <Type className="h-3 w-3" />
              Repetition
            </p>
            <p className="text-xs text-muted-foreground">
              Repeated words: <span className="font-medium text-foreground">{analysis.repeatedWords.join(", ")}</span>
            </p>
          </div>
        )}

        {analysis.spellingErrors.length === 0 && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-2">
            <p className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="h-3 w-3" />
              No spelling or grammar issues found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
