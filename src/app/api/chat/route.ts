import { streamText } from "ai";
import { router } from "@/lib/model-router";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-user rate limiting: 30 requests per minute
    const rateCheck = checkRateLimit(session.user.id);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetAt);
    }

    const { messages: rawMessages, taskType = "chat" } = await req.json();

    // Convert ai@7 UIMessage format (parts-based) to the simple format the AI SDK expects
    // UIMessages have { role, parts: [{ type: 'text', text: '...' }] }
    // We need to extract the text content for the LLM
    const messages = (rawMessages || []).map((msg: any) => {
      if (msg.content) {
        // Already in legacy format
        return { role: msg.role, content: msg.content };
      }
      if (msg.parts && Array.isArray(msg.parts)) {
        const text = msg.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text || "")
          .join("");
        return { role: msg.role, content: text };
      }
      return { role: msg.role, content: "" };
    });

    // Execute the request with automatic multi-key failover
    const { result, provider } = await router.executeWithFailover(async (p) => {
      const res = streamText({
        model: p.provider.model,
        messages,
      });

      return res;
    }, taskType as "code" | "chat");

    // return the response to the client
    return result.toUIMessageStreamResponse({
      headers: {
        "X-Kareixo-Provider": provider.name,
        "X-Kareixo-Model": provider.modelId,
      },
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "AI service unavailable. Please try again shortly." },
      { status: 503 }
    );
  }
}
