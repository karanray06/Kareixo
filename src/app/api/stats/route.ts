import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { keyPool } from "@/lib/gemini-key-pool";

/**
 * Returns key pool health summary.
 * Only shows key indices and availability — never exposes key values.
 * Scoped to authenticated users only.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const health = keyPool.getHealthSummary();
  return NextResponse.json({ pool: health });
}
