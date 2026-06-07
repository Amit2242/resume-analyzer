// lib/llm.ts — DeepSeek-compatible LLM client wrapper
// Uses OpenAI SDK pointed at DeepSeek base URL with retry, JSON repair, and Zod validation

import OpenAI from "openai";
import type { ZodSchema } from "zod";

// ── Client ──────────────────────────────────────────────────────
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "your_key_here",
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
});

const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

// ── Sleep helper for backoff ────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── JSON repair: extract from markdown fences ───────────────────
function extractJSON(raw: string): string {
  let trimmed = raw.trim();

  // Try the raw string first
  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    // fall through
  }

  // Match ```json ... ``` or ``` ... ``` fences
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) {
    const extracted = fenceMatch[1].trim();
    try {
      JSON.parse(extracted);
      return extracted;
    } catch {
      trimmed = extracted;
    }
  }

  // Try to find the outermost { } block
  const firstBrace = trimmed.indexOf("{");
  const firstBracket = trimmed.indexOf("[");
  if (firstBrace !== -1 || firstBracket !== -1) {
    const start = firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);
    const openChar = trimmed[start];
    const closeChar = openChar === "{" ? "}" : "]";
    let depth = 0;
    for (let i = start; i < trimmed.length; i++) {
      if (trimmed[i] === openChar) depth++;
      else if (trimmed[i] === closeChar) depth--;
      if (depth === 0) {
        let candidate = trimmed.slice(start, i + 1);
        // Try parsing raw; if it fails, try replacing single quotes
        try {
          JSON.parse(candidate);
          return candidate;
        } catch {
          // Replace single quotes around property names with double quotes
          candidate = candidate.replace(/(\s*:\s*)'([^']+)'/g, '$1"$2"');
          candidate = candidate.replace(/^'|'$/g, '"');
          try {
            JSON.parse(candidate);
            return candidate;
          } catch {
            // Return the best candidate anyway
            return candidate;
          }
        }
      }
    }
  }

  return trimmed;
}

// ── Structured API Error ───────────────────────────────────────
export interface LLMStructuredError {
  error: true;
  code: "LLM_ERROR" | "VALIDATION_ERROR" | "PARSE_ERROR" | "RATE_LIMIT";
  message: string;
  details?: unknown;
}

function toStructuredError(err: unknown, code: LLMStructuredError["code"], details?: unknown): LLMStructuredError {
  const message = err instanceof Error ? err.message : String(err);
  return { error: true as const, code, message, details };
}

// ── Core API call with retry ────────────────────────────────────
async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const startTime = Date.now();
  let lastError: unknown;

  // Retry strategy: up to 3 total attempts
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content ?? "";
      const latency = Date.now() - startTime;

      console.log(
        `[LLM] model=${DEFAULT_MODEL} ` +
          `systemLen=${systemPrompt.length} userLen=${userPrompt.length} ` +
          `responseLen=${content.length} latency=${latency}ms`,
      );

      return content;
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;

      // 429 — rate limit, exponential backoff
      if (status === 429 && attempt < 2) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`[LLM] rate limited (429), retrying in ${delay}ms (attempt ${attempt + 1}/3)`);
        await sleep(delay);
        continue;
      }

      // 5xx — server error, retry with backoff
      if (status && status >= 500 && status < 600 && attempt < 1) {
        console.warn(`[LLM] server error (${status}), retrying (attempt ${attempt + 1}/3)`);
        await sleep(1000);
        continue;
      }

      // Non-retriable error
      break;
    }
  }

  const latency = Date.now() - startTime;
  console.error(`[LLM] FAILED after ${latency}ms`);
  throw toStructuredError(lastError, "LLM_ERROR");
}

// ── Public: Validated JSON call ─────────────────────────────────
export async function callLLM<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: ZodSchema<T>,
  options?: { temperature?: number; maxTokens?: number },
): Promise<T> {
  const temperature = options?.temperature ?? 0;
  const maxTokens = options?.maxTokens ?? 2000;

  // 1. Call DeepSeek
  const rawText = await callDeepSeek(systemPrompt, userPrompt, temperature, maxTokens);

  // 2. Extract JSON from raw text (handles markdown fences)
  const jsonText = extractJSON(rawText);

  // 3. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error("[LLM] JSON parse failed. Raw response (truncated):", rawText.slice(0, 500));
    throw toStructuredError(err, "PARSE_ERROR", { rawSnippet: rawText.slice(0, 500) });
  }

  // 4. Validate against Zod schema
  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error("[LLM] Zod validation failed. Issues:", JSON.stringify(result.error.issues, null, 2));
    throw toStructuredError(
      new Error("LLM returned invalid schema"),
      "VALIDATION_ERROR",
      result.error.issues,
    );
  }

  return result.data;
}

// ── Public: Raw text call (no schema validation) ────────────────
export async function callLLMRaw(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  return callDeepSeek(systemPrompt, userPrompt, 0, 2000);
}
