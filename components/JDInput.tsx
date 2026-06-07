"use client";

import { Textarea } from "@/components/ui/textarea";

interface JDInputProps {
  value: string;
  onChange: (text: string) => void;
}

export default function JDInput({ value, onChange }: JDInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor="jd-input" className="text-sm font-medium">
          Job Description
        </label>
        <span className="text-xs text-muted-foreground">
          {value.length} chars
        </span>
      </div>
      <Textarea
        id="jd-input"
        placeholder="Paste the job description here..."
        className="min-h-[320px] resize-y font-mono text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

