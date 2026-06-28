import { streamText, generateText } from "ai";
import { router } from "@/lib/model-router";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, taskType = "chat", forceProvider } = await req.json();

    // OPTION A: make a cheap non-streaming probe call first to confirm the
    // provider is alive. If it 429s or errors, executeWithFailover catches it
    // and retries with the next provider in the round-robin list.
    const { provider } = await router.executeWithFailover(async (p) => {
      // Probe: single-token generation — cheap, but triggers real auth + quota check
      await generateText({
        model: p.model,
        messages: [{ role: "user", content: "ping" }],
      });
      return p;
    }, taskType as "code" | "chat");

    // Provider confirmed live — now stream the real request
    const result = await streamText({
      model: provider.model,
      messages,
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Kareixo-Provider": provider.name,
        "X-Kareixo-Model": provider.modelName,
      },
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "All providers are currently unavailable. Please try again shortly." },
      { status: 503 }
    );
  }
}
