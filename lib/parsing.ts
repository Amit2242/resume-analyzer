// lib/parsing.ts — File parsing utilities (PDF, DOCX), text sanitization, and truncation

/**
 * Extract raw text from a PDF buffer using pdf-parse.
 * Throws { code: 'PARSE_ERROR', message: '...' } on failure.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  try {
    const data = await pdfParse(buffer);
    const text = data.text?.trim() ?? "";
    console.log(`[parsePDF] extracted ${text.length} chars, ${data.numpages ?? "?"} pages`);

    if (text.length < 20) {
      throw {
        code: "PARSE_ERROR" as const,
        message:
          "This PDF appears to be a scanned image or doesn't contain extractable text. pdf-parse could only extract " +
          `${text.length} characters. Please paste your resume as plain text instead.`,
      };
    }

    return text;
  } catch (err: unknown) {
    // If it's already our structured error, re-throw
    if ((err as { code?: string })?.code === "PARSE_ERROR") {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[parsePDF] Failed:", msg);
    throw {
      code: "PARSE_ERROR" as const,
      message:
        "Could not read this PDF file. The file may be corrupted, password-protected, or a scanned image. " +
        "Please paste your resume as plain text instead.",
    };
  }
}

/**
 * Extract raw text from a DOCX buffer using mammoth.
 * Throws { code: 'PARSE_ERROR', message: '...' } on failure.
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? "";
  } catch {
    throw { code: "PARSE_ERROR" as const, message: "Failed to parse DOCX" };
  }
}

/**
 * Decode a base64 file and extract text based on fileType.
 */
export async function extractTextFromFile(
  base64: string,
  fileType: "pdf" | "docx",
): Promise<string> {
  const buffer = Buffer.from(base64, "base64");

  if (fileType === "pdf") {
    return extractTextFromPDF(buffer);
  }
  if (fileType === "docx") {
    return extractTextFromDOCX(buffer);
  }

  throw {
    code: "PARSE_ERROR" as const,
    message: `Unsupported file type: ${fileType}`,
  };
}

/**
 * Truncate text to a maximum character count before sending to the LLM.
 * Appends "... [truncated]" if the text exceeds the limit.
 */
export function truncateToTokenLimit(
  text: string,
  maxChars = 12000,
): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "... [truncated]";
}

/**
 * Sanitize resume text before sending to the LLM.
 * - Strips HTML / script tags
 * - Normalizes whitespace (collapses multiple spaces/newlines)
 */
export function sanitizeResumeText(text: string): string {
  return (
    text
      // Remove script and style blocks completely
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      // Strip remaining HTML tags
      .replace(/<[^>]*>/g, " ")
      // Collapse whitespace
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
