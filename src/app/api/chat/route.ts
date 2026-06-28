import { streamText } from "ai";
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

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not set. Please add it to your environment variables on Vercel." },
        { status: 401 }
      );
    }

    const { messages: rawMessages, taskType = "chat", forceProvider } = await req.json();

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

    // Pick a live provider using round-robin with failover
    const provider = router.getNextProvider(taskType as "code" | "chat", forceProvider);

    // Stream the real request
    const result = streamText({
      model: provider.model,
      messages,
    });

    // ai@7: use toUIMessageStreamResponse so the client-side useChat can parse it
    return result.toUIMessageStreamResponse({
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
