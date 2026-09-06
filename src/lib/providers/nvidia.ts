import { createOpenAI } from "@ai-sdk/openai";

/**
 * NVIDIA NIM — OpenAI-compatible endpoint.
 * 
 * Provider instances are now created dynamically per-request with the API key
 * supplied by the key pool, instead of reading from env at module-load time.
 * 
 * Model catalog — single source of truth for all NVIDIA model IDs.
 */

export const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

export const nvidiaModels = {
  llama_vision: "meta/llama-3.2-11b-vision-instruct",
} as const;

export type NvidiaModelId = (typeof nvidiaModels)[keyof typeof nvidiaModels];

/** All available NVIDIA model entries in priority order (best first). */
export const NVIDIA_MODEL_CATALOG = [
  { modelName: "Llama 3.2 Vision", modelId: nvidiaModels.llama_vision },
] as const;

export function createNvidiaProvider(apiKey: string) {
  return createOpenAI({
    baseURL: NVIDIA_BASE_URL,
    apiKey,
    fetch: async (url, options) => {
      if (options?.body && typeof options.body === "string") {
        try {
          const bodyObj = JSON.parse(options.body);
          const modelEntry = NVIDIA_MODEL_CATALOG.find((m) => m.modelId === bodyObj.model);
          if (modelEntry?.extraBody) {
            Object.assign(bodyObj, modelEntry.extraBody);
            options.body = JSON.stringify(bodyObj);
          }
        } catch (e) {
          console.error("Error intercepting NVIDIA request body", e);
        }
      }
      return fetch(url, options);
    },
  });
}
