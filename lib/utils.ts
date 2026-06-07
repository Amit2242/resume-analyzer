// lib/utils.ts — Shared utility functions
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with clsx + tailwind-merge */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a score as "N/100" */
export function formatScore(n: number): string {
  return `${Math.round(n)}/100`;
}

/** Get Tailwind text color class for a score value */
export function getScoreColor(n: number): string {
  if (n >= 80) return "text-green-500";
  if (n >= 60) return "text-yellow-500";
  return "text-red-500";
}

/** Get badge variant name for gap importance */
export function getImportanceColor(importance: "high" | "medium" | "low"): string {
  switch (importance) {
    case "high": return "destructive";
    case "medium": return "warning";
    case "low": return "secondary";
  }
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/** Generate a unique run ID */
export function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

