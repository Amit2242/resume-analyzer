"use client";

import type { SectionScore } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, XCircle, Lock } from "lucide-react";

const severityIcon: Record<string, React.ReactNode> = {
  error: <XCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export default function SectionCard({ section }: { section: SectionScore }) {
  const scoreColor = section.score >= 80 ? "text-green-500" : section.score >= 60 ? "text-yellow-500" : "text-red-500";

  const errors = section.issues.filter((i) => i.severity === "error");
  const warnings = section.issues.filter((i) => i.severity === "warning");
  const successes = section.issues.filter((i) => i.severity === "success");
  const infos = section.issues.filter((i) => i.severity === "info");

  if (section.isPremium) {
    return (
      <Card className="border-muted bg-muted/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">{section.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">This insight is available with PRO</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{section.name}</CardTitle>
          <span className={`text-lg font-bold ${scoreColor}`}>{section.score}</span>
        </div>
        <Progress value={section.score} className="h-1.5" />
      </CardHeader>
      <CardContent className="space-y-3">
        {errors.length > 0 && errors.map((issue, i) => (
          <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex items-start gap-2">
              {severityIcon.error}
              <div>
                <p className="text-xs font-medium text-red-400">{issue.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{issue.message}</p>
                {issue.suggestion && (
                  <p className="mt-1 text-[10px] text-muted-foreground/70 italic">{issue.suggestion}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {warnings.length > 0 && warnings.map((issue, i) => (
          <div key={i} className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
            <div className="flex items-start gap-2">
              {severityIcon.warning}
              <div>
                <p className="text-xs font-medium text-yellow-400">{issue.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{issue.message}</p>
                {issue.suggestion && (
                  <p className="mt-1 text-[10px] text-muted-foreground/70 italic">{issue.suggestion}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {successes.length > 0 && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-2">
            <p className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="h-3 w-3" />
              Good job! No issues found.
            </p>
          </div>
        )}

        {infos.length > 0 && infos.map((issue, i) => (
          <div key={i} className="rounded-lg border border-border bg-card/50 p-3">
            <div className="flex items-start gap-2">
              {severityIcon.info}
              <div>
                <p className="text-xs font-medium">{issue.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{issue.message}</p>
              </div>
            </div>
          </div>
        ))}

        {section.issues.length === 0 && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-2">
            <p className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="h-3 w-3" />
              No issues found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
