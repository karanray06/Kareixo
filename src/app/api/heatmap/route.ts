import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyzeCodeHeatmap } from "@/lib/heatmap-analyzer";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, language, filename } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Missing 'code' field (string)" },
        { status: 400 }
      );
    }

    if (code.length > 50_000) {
      return NextResponse.json(
        { error: "Code too large (max 50KB)" },
        { status: 400 }
      );
    }

    const lang = language || "typescript";

    const { result, provider } = await analyzeCodeHeatmap(code, lang, filename);

    return NextResponse.json({
      ...result,
      provider,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Heatmap API] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Error" },
      { status: 500 }
    );
  }
}
