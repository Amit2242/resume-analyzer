"use client";

import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface ResumeInputProps {
  value: string;
  onChange: (text: string) => void;
  onFileUpload?: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export default function ResumeInput({
  value,
  onChange,
  onFileUpload,
  isUploading = false,
}: ResumeInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileUpload) return;
    await onFileUpload(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor="resume-input" className="text-sm font-medium">
          Resume
        </label>
        <span id="resume-char-count" className="text-xs text-muted-foreground" aria-live="polite">
          {value.length} chars
        </span>
      </div>

      <Textarea
        id="resume-input"
        aria-describedby="resume-char-count resume-upload-help"
        placeholder="Paste your resume here..."
        className="min-h-[320px] resize-y font-mono text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.docx"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload a PDF or DOCX file"
      />

      <Button
        variant="outline"
        size="sm"
        className="w-fit gap-2"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Upload a PDF or DOCX file"
        aria-describedby="resume-upload-help"
        title="Supported: .pdf, .docx"
        type="button"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing file...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload PDF / DOCX
          </>
        )}
      </Button>
      <p id="resume-upload-help" className="text-xs text-muted-foreground">
        Upload PDF or DOCX to auto-extract the resume text. If upload fails, paste your resume manually.
      </p>
    </div>
  );
}

