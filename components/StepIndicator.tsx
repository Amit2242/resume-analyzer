"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  { key: "input", label: "Input" },
  { key: "analysis", label: "Analysis" },
  { key: "editor", label: "Editor" },
  { key: "export", label: "Export" },
] as const;

type StepKey = (typeof steps)[number]["key"];

export default function StepIndicator({ currentStep }: { currentStep: string }) {
  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, i) => {
          const isComplete = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isUpcoming = i > currentIdx;

          return (
            <li key={step.key} className="flex items-center gap-2">
              {/* Step circle */}
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isComplete && "bg-primary text-primary-foreground",
                  isCurrent && "border-2 border-primary bg-primary/10 text-primary",
                  isUpcoming && "border-2 border-border bg-card text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              {/* Label */}
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  isCurrent && "text-foreground",
                  isUpcoming && "text-muted-foreground",
                  isComplete && "text-foreground",
                )}
              >
                {step.label}
              </span>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "mx-1 hidden h-px w-8 sm:block",
                    i < currentIdx ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

