import { streamText } from "ai";
import { router } from "@/lib/model-router";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60s for LLM response

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, taskType = "chat", forceProvider } = await req.json();

    // Use our custom router to find an available provider with automatic failover
    const { provider } = await router.executeWithFailover(async (p) => {
      // Just resolving the provider here. If streamText fails later during iteration, 
      // the Vercel AI SDK handles it, though our router failover is best used before the stream starts.
      return p;
    }, taskType as "code" | "chat");

    const result = await streamText({
      model: provider.model,
      messages,
      headers: {
        // Expose the provider info to the client so it can render the badge
        "X-Kareixo-Provider": provider.name,
        "X-Kareixo-Model": provider.modelName,
      }
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Kareixo-Provider": provider.name,
        "X-Kareixo-Model": provider.modelName,
      }
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during chat routing" },
      { status: 500 }
    );
  }
}
