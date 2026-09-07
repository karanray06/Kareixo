import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const geminiModels = {
  gemini_flash: "gemini-3.6-flash",
  gemini_pro: "gemini-3.6-pro",
} as const;

export type GeminiModelId = (typeof geminiModels)[keyof typeof geminiModels];

export interface GeminiModelEntry {
  modelName: string;
  modelId: GeminiModelId;
}

export const GEMINI_MODEL_CATALOG: readonly GeminiModelEntry[] = [
  { modelName: "Gemini 3.6 Flash", modelId: geminiModels.gemini_flash },
  { modelName: "Gemini 3.6 Pro", modelId: geminiModels.gemini_pro },
];

export function createGeminiProvider(apiKey: string) {
  return createGoogleGenerativeAI({
    apiKey,
  });
}
