import { streamText, tool } from "ai";
import { z } from "zod";

// Mock provider since we don't have mock-provider.js
const provider = () => ({
  specificationVersion: 'v1',
  provider: 'mock',
  modelId: 'my-model',
  defaultObjectGenerationMode: 'json',
  async doStream(options: any) {
    return {
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({ type: 'tool-call', toolCallType: 'function', toolCallId: '1', toolName: 'listDirectory', args: '{"path":""}' });
          controller.close();
        }
      }),
      rawCall: { rawPrompt: null, rawSettings: {} }
    };
  }
});

const tools = {
  listDirectory: tool({
    description: "List files and subdirectories. Use an empty string '' for the root directory.",
    inputSchema: z.object({ path: z.string() }),
    execute: async ({ path }) => {
      return "file1.txt\nfile2.txt";
    }
  })
};

async function main() {
  const res = streamText({
    model: provider() as any,
    messages: [{ role: "user", content: "list files" }],
    tools,
    maxSteps: 2,
  });

  const reader = res.fullStream.getReader();
  const buffered = [];
  for (let i = 0; i < 2; i++) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffered.push(chunk.value);
  }

  const customFullStream = new ReadableStream({
    start(controller) {
      for (const chunk of buffered) controller.enqueue(chunk);
    },
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) controller.close();
      else controller.enqueue(value);
    }
  });

  Object.defineProperty(res, "fullStream", { value: customFullStream, configurable: true });

  const uiResponse = res.toUIMessageStreamResponse();
  const uiReader = uiResponse.body?.getReader();
  const decoder = new TextDecoder();
  let hasContent = false;
  while (true) {
    const chunk = await uiReader.read();
    if (chunk.done) break;
    console.log("UI CHUNK:", decoder.decode(chunk.value));
    hasContent = true;
  }
  if (!hasContent) console.log("UI RESPONSE WAS EMPTY!");
}
main();
