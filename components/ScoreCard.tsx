"use client";

import type { MatchScore } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  score: MatchScore;
  label: string;
  variant: "original" | "tailored";
}

export default function ScoreCard({ score, label, variant }: ScoreCardProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score.overallScore / 100) * circumference;

  const bars: { name: string; value: number }[] = [
    { name: "Skills", value: score.skillCoverageScore },
    { name: "Responsibilities", value: score.responsibilityAlignmentScore },
    { name: "Keywords", value: score.keywordScore },
    { name: "Seniority", value: score.seniorityScore },
  ];

  return (
    <Card className={variant === "tailored" ? "border-primary/40" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Circular gauge */}
        <div className="flex items-center gap-6">
          <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={variant === "tailored" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
              className="transition-all duration-1000 ease-out"
            />
            <text
              x="70"
              y="66"
              textAnchor="middle"
              className="fill-foreground text-2xl font-bold"
            >
              {score.overallScore}
            </text>
            <text
              x="70"
              y="86"
              textAnchor="middle"
              className="fill-muted-foreground text-xs"
            >
              / 100
            </text>
          </svg>

          {/* Sub-score bars */}
          <div className="flex-1 space-y-2">
            {bars.map((bar) => (
              <div key={bar.name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{bar.name}</span>
                  <span className="font-mono tabular-nums">{bar.value}</span>
                </div>
                <Progress value={bar.value} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs leading-relaxed text-muted-foreground">
          {score.explanation}
        </p>

        {/* Critical gaps */}
        {score.criticalMissingRequirements.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-destructive">Critical gaps:</p>
            <ul className="list-inside list-disc text-xs text-muted-foreground">
              {score.criticalMissingRequirements.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

