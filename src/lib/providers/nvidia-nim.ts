import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const createKimiProvider = (apiKey: string) => {
  if (!apiKey) throw new Error("NVIDIA NIM API key is missing for Kimi.");
  return createOpenAICompatible({
    name: "nvidia-nim-kimi",
    baseURL: "https://integrate.api.nvidia.com/v1",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
};

export const createMistralProvider = (apiKey: string) => {
  if (!apiKey) throw new Error("NVIDIA NIM API key is missing for Mistral.");
  return createOpenAICompatible({
    name: "nvidia-nim-mistral",
    baseURL: "https://integrate.api.nvidia.com/v1",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
};

export const NVIDIA_NIM_MODEL_CATALOG = [
  {
    modelId: "mistralai/mistral-nemotron",
    modelName: "NVIDIA NIM: Mistral-Nemotron",
    supportsTools: true,
  },
  {
    modelId: "moonshotai/kimi-k3",
    modelName: "NVIDIA NIM: Kimi K3",
    supportsTools: true,
  },
];
