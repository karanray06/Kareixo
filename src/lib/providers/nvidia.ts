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
  deepseek_v4_pro: "deepseek-ai/deepseek-v4-pro-0813",
  gemma4_31b: "google/gemma-4-31b-it",
} as const;

export type NvidiaModelId = (typeof nvidiaModels)[keyof typeof nvidiaModels];

/** All available NVIDIA model entries in priority order (best first). */
export const NVIDIA_MODEL_CATALOG = [
  { modelName: "DeepSeek V4 Pro",   modelId: nvidiaModels.deepseek_v4_pro },
  { modelName: "Gemma 4 31B",       modelId: nvidiaModels.gemma4_31b },
] as const;

/**
 * Create an NVIDIA provider instance with a specific API key.
 * Called per-request by the model router with the key selected from the pool.
 */
export function createNvidiaProvider(apiKey: string) {
  return createOpenAI({
    baseURL: NVIDIA_BASE_URL,
    apiKey,
  });
}
