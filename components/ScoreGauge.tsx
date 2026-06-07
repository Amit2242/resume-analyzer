"use client";

import type { ResumeAnalysis } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";

export default function ScoreGauge({ analysis }: { analysis: ResumeAnalysis }) {
  const score = analysis.overallScore;
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;

  const scoreColor = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      {/* Circular gauge */}
      <div className="relative shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="60" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <circle
            cx="80" cy="80" r="60"
            fill="none"
            stroke={scoreColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 80 80)"
            className="transition-all duration-1000 ease-out"
          />
          <text x="80" y="72" textAnchor="middle" className="fill-foreground text-3xl font-bold">{score}</text>
          <text x="80" y="92" textAnchor="middle" className="fill-muted-foreground text-xs">/ 100</text>
        </svg>
      </div>

      {/* Summary */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold">Resume Scorecard</h2>
          <Badge variant={score >= 60 ? "success" : "destructive"} className="text-xs">
            {analysis.totalIssues} {analysis.totalIssues === 1 ? "Issue" : "Issues"}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {analysis.atsParsed.message}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>ATS Parse Rate:</span>
          <span className={`font-semibold ${analysis.atsParsed.rate >= 80 ? "text-green-500" : analysis.atsParsed.rate >= 50 ? "text-yellow-500" : "text-red-500"}`}>
            {analysis.atsParsed.rate}%
          </span>
        </div>
      </div>
    </div>
  );
}
