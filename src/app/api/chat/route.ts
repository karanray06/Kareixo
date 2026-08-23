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

    const allRequiredKeys = router.allRequiredEnvVars;
    const hasAnyKey = allRequiredKeys.some((key) => !!process.env[key]);
    
    if (!hasAnyKey) {
      return NextResponse.json(
        { error: `No AI provider keys configured. Please add at least one of these to your environment variables: ${allRequiredKeys.join(", ")}` },
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

    // Execute the request with automatic failover
    const { result, provider } = await router.executeWithFailover(async (p) => {
      const res = streamText({
        model: p.model,
        messages,
      });

      // Intercept the stream to catch immediate failures (e.g. 401/429) before streaming
      const reader = res.fullStream.getReader();
      const chunk1 = await reader.read();
      const chunk2 = await reader.read();

      // If the API call fails immediately, chunk2 will be the error
      if (chunk2.value && chunk2.value.type === "error") {
        throw chunk2.value.error;
      }

      // It's a valid stream. Reconstruct fullStream so the start chunks aren't lost.
      const customFullStream = new ReadableStream({
        start(controller) {
          if (!chunk1.done) controller.enqueue(chunk1.value);
          if (!chunk2.done) controller.enqueue(chunk2.value);
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
      { error: error.message || "All providers are currently unavailable. Please try again shortly." },
      { status: 503 }
    );
  }
}
