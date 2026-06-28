import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStats } from "@/lib/quota-tracker";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stats = await getStats();
  return NextResponse.json(stats);
}
