"use client";

import { useState } from "react";
import type { BulletRewrite } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

const confidenceColor: Record<string, "success" | "warning" | "destructive"> = {
  high: "success",
  medium: "warning",
  low: "destructive",
};

export default function BulletDiffRow({ bullet }: { bullet: BulletRewrite }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      {/* Two-column layout */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Original */}
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Original
          </p>
          <p className="text-sm leading-relaxed">{bullet.original}</p>
        </div>
        {/* Tailored */}
        <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Tailored
          </p>
          <p className="text-sm leading-relaxed">{bullet.tailored}</p>
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={confidenceColor[bullet.confidence]} className="text-[10px]">
          {bullet.confidence} confidence
        </Badge>
        {bullet.keywordsAddressed.map((kw) => (
          <Badge key={kw} variant="outline" className="text-[10px]">
            {kw}
          </Badge>
        ))}
        {typeof bullet.riskFlag === "string" && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {bullet.riskFlag}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7 gap-1 text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide reason" : "Why this change?"}
        </Button>
      </div>

      {/* Expandable reason */}
      {expanded && (
        <div className="rounded-md border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Reason: </span>
          {bullet.changeReason}
        </div>
      )}
    </div>
  );
}

