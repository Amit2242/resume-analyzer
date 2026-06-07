"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import {
  Gauge,
  FileSearch,
  PenLine,
  FileDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Gauge,
    title: "Match Scoring",
    description:
      "See exactly how well your resume aligns with the target job — with explainable scores.",
  },
  {
    icon: PenLine,
    title: "Smart Tailoring",
    description:
      "Get AI-rewritten bullets that match the JD while staying truthful to your experience.",
  },
  {
    icon: FileSearch,
    title: "Gap Analysis",
    description:
      "Identify missing skills, weak areas, and get actionable suggestions for each gap.",
  },
  {
    icon: FileDown,
    title: "PDF Export",
    description:
      "Download a professional side-by-side PDF showing every change with proof.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const loadMockData = useAppStore((s) => s.loadMockData);

  return (
    <main className="flex flex-col items-center px-4 py-20">
      {/* Hero */}
      <section className="max-w-3xl space-y-6 text-center">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <Sparkles className="h-3 w-3" />
          AI-Powered
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Turn any job description into a{" "}
          <span className="text-primary">targeted resume rewrite</span>
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          AI-powered resume tailoring with match scoring, gap analysis, and side-by-side PDF proof — all while keeping your experience truthful.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/input">
              Start Tailoring
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              loadMockData();
              router.push("/analysis");
            }}
          >
            Load Demo
          </Button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mt-24 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <Card key={f.title} className="border-border/60 bg-card/50">
            <CardHeader className="pb-2">
              <f.icon className="mb-1 h-9 w-9 text-primary" />
              <CardTitle className="text-base">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{f.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}

