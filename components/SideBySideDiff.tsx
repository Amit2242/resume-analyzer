"use client";

import type { TailoredResume } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BulletDiffRow from "@/components/BulletDiffRow";

export default function SideBySideDiff({ data }: { data: TailoredResume }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Bullet-by-Bullet Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.tailoredSummary && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tailored Summary
            </p>
            <p className="text-sm leading-relaxed">{data.tailoredSummary}</p>
          </div>
        )}
        <Separator />
        {data.tailoredExperience.map((exp) => (
          <div key={exp.company} className="space-y-4">
            <div>
              <p className="font-semibold">{exp.title}</p>
              <p className="text-sm text-muted-foreground">{exp.company}</p>
            </div>
            {exp.bullets.map((b, i) => (
              <BulletDiffRow key={i} bullet={b} />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

