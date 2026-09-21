import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const KIMI_API_KEY = process.env.NVIDIA_NIM_KIMI_API_KEY || "";
const MISTRAL_API_KEY = process.env.NVIDIA_NIM_MISTRAL_API_KEY || "";

export const createKimiProvider = () => {
  return createOpenAICompatible({
    name: "nvidia-nim-kimi",
    baseURL: "https://integrate.api.nvidia.com/v1",
    headers: {
      Authorization: `Bearer ${KIMI_API_KEY}`,
    },
  });
};

export const createMistralProvider = () => {
  return createOpenAICompatible({
    name: "nvidia-nim-mistral",
    baseURL: "https://integrate.api.nvidia.com/v1",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
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
