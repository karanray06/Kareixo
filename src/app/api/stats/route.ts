import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { keyPool } from "@/lib/gemini-key-pool";
import { checkModelAvailability } from "@/lib/provider-health-check";

/**
 * Returns key pool health summary and model provider availability.
 * Only shows key indices and availability — never exposes key values.
 * Scoped to authenticated users only.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const health = keyPool.getHealthSummary();
  const models = await checkModelAvailability();
  
  return NextResponse.json({ pool: health, models });
}
