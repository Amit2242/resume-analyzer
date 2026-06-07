// lib/rate-limiter.ts — Simple in-memory rate limiter for API routes

const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000; // 1 minute

/**
 * Returns true if the IP has exceeded the rate limit.
 * Resets the counter after the window expires.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    return true;
  }

  return false;
}

/** Get the client IP from a Next.js request headers */
export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}
