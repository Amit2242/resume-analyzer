"use client";

import type { GapAnalysis as GapAnalysisType } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const importanceColor: Record<string, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

export default function GapAnalysis({ data }: { data: GapAnalysisType }) {
  const groups = {
    high: data.gaps.filter((g) => g.importance === "high"),
    medium: data.gaps.filter((g) => g.importance === "medium"),
    low: data.gaps.filter((g) => g.importance === "low"),
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Skill Gaps</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Gap</TableHead>
              <TableHead className="w-[80px]">Priority</TableHead>
              <TableHead className="hidden sm:table-cell">JD Evidence</TableHead>
              <TableHead>Suggested Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {([...groups.high, ...groups.medium, ...groups.low] as typeof data.gaps).map((gap) => (
              <TableRow key={gap.name}>
                <TableCell className="font-medium">{gap.name}</TableCell>
                <TableCell>
                  <Badge variant={importanceColor[gap.importance]}>
                    {gap.importance}
                  </Badge>
                </TableCell>
                <TableCell className="hidden max-w-[200px] truncate text-xs text-muted-foreground sm:table-cell">
                  {gap.jdEvidence}
                </TableCell>
                <TableCell className="max-w-[240px] text-xs">
                  {gap.suggestedAction}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

