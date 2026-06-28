import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy initialization — only connects when actually called (not on module load).
// This prevents the landing page from crashing when DATABASE_URL isn't set.
let _db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Please add it to .env.local — see .env.example for instructions."
      );
    }
    const sql: NeonQueryFunction<false, false> = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Re-export for backward compat — will throw a clear error if used without DATABASE_URL
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
