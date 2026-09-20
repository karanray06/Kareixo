import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const geminiModels = {
  gemini_flash: "gemini-3.8-flash",
  // NOTE: gemini-3.6-pro never existed. The latest stable Pro is gemini-2.5-pro.
  // If you want bleeding-edge Pro, use "gemini-3.1-pro-preview" (preview endpoint, may churn).
  gemini_pro: "gemini-2.5-pro",
} as const;

export type GeminiModelId = (typeof geminiModels)[keyof typeof geminiModels];

export interface GeminiModelEntry {
  modelName: string;
  modelId: GeminiModelId;
}

export const GEMINI_MODEL_CATALOG: readonly GeminiModelEntry[] = [
  { modelName: "Gemini 3.8 Flash", modelId: geminiModels.gemini_flash },
  { modelName: "Gemini 2.5 Pro", modelId: geminiModels.gemini_pro },
];

export function createGeminiProvider(apiKey: string) {
  return createGoogleGenerativeAI({
    apiKey,
  });
}
