import { createOpenAI } from "@ai-sdk/openai";

export const pollinationsModels = {
  openai: "openai",
  mistral: "mistral",
} as const;

export type PollinationsModelId = (typeof pollinationsModels)[keyof typeof pollinationsModels];

export interface PollinationsModelEntry {
  modelName: string;
  modelId: PollinationsModelId;
}

export const POLLINATIONS_MODEL_CATALOG: readonly PollinationsModelEntry[] = [
  { modelName: "Pollinations OpenAI", modelId: pollinationsModels.openai },
  { modelName: "Pollinations Mistral", modelId: pollinationsModels.mistral },
];

export function createPollinationsProvider(apiKey: string) {
  return createOpenAI({
    baseURL: "https://text.pollinations.ai/openai",
    apiKey,
    fetch: async (url, options) => {
      const res = await fetch(url, options);
      if (!res.ok || !res.body) return res;

      let buffer = "";
      const transformStream = new TransformStream({
        transform(chunk, controller) {
          buffer += new TextDecoder().decode(chunk);
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.choices && data.choices[0] && data.choices[0].delta) {
                  const content = data.choices[0].delta.content;
                  const role = data.choices[0].delta.role;
                  // Preserve finish_reason — the AI SDK's OpenAI-compatible
                  // parser needs it to detect stream completion.
                  const finishReason = data.choices[0].finish_reason;
                  // Preserve usage data if present (some providers include it
                  // in the final chunk).
                  const usage = data.usage;

                  data.choices[0].delta = {};
                  if (content !== undefined) data.choices[0].delta.content = content;
                  if (role !== undefined) data.choices[0].delta.role = role;
                  // Re-attach finish_reason at the choice level (not inside delta)
                  if (finishReason !== undefined) data.choices[0].finish_reason = finishReason;
                  // Re-attach usage at the top level
                  if (usage !== undefined) data.usage = usage;
                }
                controller.enqueue(new TextEncoder().encode('data: ' + JSON.stringify(data) + '\n'));
                continue;
              } catch (e) {
                // Ignore parse errors, just pass through
              }
            }
            controller.enqueue(new TextEncoder().encode(line + '\n'));
          }
        },
        flush(controller) {
          if (buffer) {
            controller.enqueue(new TextEncoder().encode(buffer));
          }
        }
      });

      return new Response(res.body.pipeThrough(transformStream), {
        status: res.status,
        headers: res.headers,
      });
    },
  });
}
