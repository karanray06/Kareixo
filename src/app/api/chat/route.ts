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
        model: p.model,
        messages,
      });

      // Intercept the stream to catch immediate failures (e.g. 401/429) before streaming
      const reader = res.fullStream.getReader();
      const buffered: any[] = [];
      let streamError: any = null;

      for (let i = 0; i < 1; i++) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value.type === "error") {
          streamError = value.error;
          break;
        }
        buffered.push(value);
      }

      if (streamError) {
        throw streamError;
      }

      // It's a valid stream. Reconstruct fullStream so the start chunks aren't lost.
      const customFullStream = new ReadableStream({
        start(controller) {
          for (const chunk of buffered) controller.enqueue(chunk);
        },
        async pull(controller) {
          const { done, value } = await reader.read();
          if (done) controller.close();
          else controller.enqueue(value);
        },
        cancel() {
          reader.cancel();
        }
      });

      // Override fullStream property bypass readonly
      Object.defineProperty(res, "fullStream", { value: customFullStream, configurable: true });

      return res;
    }, taskType as "code" | "chat");

    // return the response to the client
    return result.toUIMessageStreamResponse({
      headers: {
        "X-Kareixo-Provider": provider.name,
        "X-Kareixo-Model": provider.modelName,
      },
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "All Gemini API keys are currently exhausted. Please try again shortly." },
      { status: 503 }
    );
  }
}
