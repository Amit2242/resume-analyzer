"use client";

import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-yellow-600/30 bg-yellow-950/30 p-4 text-sm text-yellow-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
      <p>
        {message ??
          "All generated content must be reviewed before use. This tool helps you express your genuine experience — never submit unverified information."}
      </p>
    </div>
  );
}

