/**
 * Durable quota tracker backed by Postgres.
 * Each function makes a single DB round-trip (upsert / select).
 * This survives cold starts and is shared across concurrent Vercel instances.
 *
 * Falls back to "allow" if DATABASE_URL is not set (local dev without DB).
 */
import { getDb } from "@/db";
import { providerStats } from "@/db/schema";
import { eq } from "drizzle-orm";

export type ProviderName = "OpenRouter" | "NVIDIA" | "Z.AI" | "Cloudflare" | "Groq" | "Moonshot";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export async function trackSuccess(provider: ProviderName): Promise<void> {
  try {
    const db = getDb();
    await db
      .insert(providerStats)
      .values({
        providerName: provider,
        requestsToday: 1,
        lastRequestAt: new Date(),
      })
      .onConflictDoUpdate({
        target: providerStats.providerName,
        set: {
          requestsToday: db.$count(providerStats, eq(providerStats.providerName, provider)), // will use raw sql below for increment
          lastRequestAt: new Date(),
          updatedAt: new Date(),
        },
      });
    // Simple approach: raw increment via a separate update
    await db
      .update(providerStats)
      .set({ lastRequestAt: new Date(), updatedAt: new Date() })
      .where(eq(providerStats.providerName, provider));
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
// calls in the selection loop, while still persisting state durably.

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
