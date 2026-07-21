/**
 * Durable quota tracker backed by Postgres.
 * Each function makes a single DB round-trip (upsert / select).
 * This survives cold starts and is shared across concurrent Vercel instances.
 *
 * Falls back to "allow" if DATABASE_URL is not set (local dev without DB).
 */
import { getDb } from "@/db";
import { providerStats } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export type ProviderName = "OpenRouter" | "NVIDIA" | "Z.AI" | "Cloudflare" | "Groq" | "Moonshot";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export async function trackSuccess(provider: ProviderName): Promise<void> {
  try {
    const db = getDb();
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // First read the current record to check if we need to reset the date
    const [row] = await db
      .select({ statsDate: providerStats.statsDate })
      .from(providerStats)
      .where(eq(providerStats.providerName, provider));
      
    let resetCount = false;
    if (!row || row.statsDate !== todayStr) {
      resetCount = true;
    }

    await db
      .insert(providerStats)
      .values({
        providerName: provider,
        requestsToday: 1,
        statsDate: todayStr,
        lastRequestAt: new Date(),
      })
      .onConflictDoUpdate({
        target: providerStats.providerName,
        set: {
          // If the date changed, reset to 1, else increment
          requestsToday: resetCount ? 1 : sql`${providerStats.requestsToday} + 1`,
          statsDate: todayStr,
          lastRequestAt: new Date(),
          updatedAt: new Date(),
        },
      });
  } catch (e) {
    // Non-fatal: tracker failure should not block the user
    console.warn("[QuotaTracker] trackSuccess failed:", e);
  }
}

export async function trackRateLimit(provider: ProviderName): Promise<void> {
  try {
    const db = getDb();
    await db
      .insert(providerStats)
      .values({
        providerName: provider,
        rateLimitHits: 1,
        lastRateLimitAt: new Date(),
        lastRequestAt: new Date(),
      })
      .onConflictDoUpdate({
        target: providerStats.providerName,
        set: {
          lastRateLimitAt: new Date(),
          lastRequestAt: new Date(),
          updatedAt: new Date(),
        },
      });
  } catch (e) {
    console.warn("[QuotaTracker] trackRateLimit failed:", e);
  }
}

export async function shouldSkip(provider: ProviderName): Promise<boolean> {
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(providerStats)
      .where(eq(providerStats.providerName, provider));

    if (!row?.lastRateLimitAt) return false;

    const elapsed = Date.now() - new Date(row.lastRateLimitAt).getTime();
    return elapsed < RATE_LIMIT_WINDOW_MS;
  } catch (e) {
    // If DB unreachable, default to allowing the provider (fail open)
    console.warn("[QuotaTracker] shouldSkip failed, defaulting to allow:", e);
    return false;
  }
}

export async function getStats(): Promise<Record<ProviderName, { requestsToday: number; rateLimitHits: number; lastRateLimitAt: Date | null }>> {
  const db = getDb();
  const rows = await db.select().from(providerStats);
  const result: any = {};
  for (const row of rows) {
    result[row.providerName] = {
      requestsToday: row.requestsToday,
      rateLimitHits: row.rateLimitHits,
      lastRateLimitAt: row.lastRateLimitAt,
    };
  }
  return result;
}

// ── Legacy sync compatibility shim for model-router.ts ───────────────────────
// The router calls these synchronously in a hot path; we keep a short-lived
// in-process cache and flush async. This avoids making every route await DB
// calls in the selection loop.
// 
// TRADEOFF: This in-memory cache is NOT shared across Vercel instances.
// In a serverless environment, concurrent requests might hit different instances,
// meaning rate-limit enforcement is imperfect. However, since this is just for
// falling back when one free-tier provider is exhausted, a few leaked requests
// are acceptable and preferable to blocking the hot path on Postgres.

const syncCache = new Map<ProviderName, { rateLimitAt: number }>();

export const quotaTracker = {
  trackSuccess(provider: ProviderName) {
    // Fire-and-forget
    trackSuccess(provider).catch(() => {});
  },
  trackRateLimit(provider: ProviderName) {
    syncCache.set(provider, { rateLimitAt: Date.now() });
    trackRateLimit(provider).catch(() => {});
  },
  shouldSkip(provider: ProviderName): boolean {
    const cached = syncCache.get(provider);
    if (!cached) return false;
    return Date.now() - cached.rateLimitAt < RATE_LIMIT_WINDOW_MS;
  },
  getStats,
};
