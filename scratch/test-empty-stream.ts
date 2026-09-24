import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('data: {"id":"chatcmpl-123","choices":[{"delta":{"content":"Hello "}}]}\n\n');
  res.write('data: {"id":"chatcmpl-123","choices":[{"delta":{"content":"World"}}]}\n\n');
  res.write('data: [DONE]\n\n');
  res.end();
});

server.listen(3001, async () => {
  const provider = createOpenAICompatible({
    name: "test",
    baseURL: "http://localhost:3001",
    headers: { Authorization: "Bearer test" },
  });

  const res = streamText({
    model: provider("test-model"),
    messages: [{ role: "user", content: "hi" }],
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
  server.close();
});
