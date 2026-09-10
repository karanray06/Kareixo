import { createOpenAI } from "@ai-sdk/openai";

export const pollinationsModels = {
  openai: "openai",
  mistral: "mistral",
  searchgpt: "searchgpt",
} as const;

export type PollinationsModelId = (typeof pollinationsModels)[keyof typeof pollinationsModels];

export interface PollinationsModelEntry {
  modelName: string;
  modelId: PollinationsModelId;
}

export const POLLINATIONS_MODEL_CATALOG: readonly PollinationsModelEntry[] = [
  { modelName: "Pollinations OpenAI", modelId: pollinationsModels.openai },
  { modelName: "Pollinations Mistral", modelId: pollinationsModels.mistral },
  { modelName: "Pollinations SearchGPT", modelId: pollinationsModels.searchgpt },
];

export function createPollinationsProvider(apiKey: string) {
  return createOpenAI({
    baseURL: "https://text.pollinations.ai/openai",
    apiKey,
  });
}
