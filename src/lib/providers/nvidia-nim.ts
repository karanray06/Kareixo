/**
 * NVIDIA NIM Provider — OpenAI-compatible endpoint for tool-calling models.
 *
 * Uses @ai-sdk/openai-compatible to connect to NVIDIA's integrate API.
 * Base URL: https://integrate.api.nvidia.com/v1
 *
 * Models:
 *  - mistralai/mistral-nemotron  (fast, tool-calling capable)
 *  - moonshotai/kimi-k3          (deep reasoning, tool-calling capable)
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const NVIDIA_NIM_API_KEY = process.env.NVIDIA_NIM_API_KEY || "";

export const createNvidiaNimProvider = () => {
  return createOpenAICompatible({
    name: "nvidia-nim",
    baseURL: "https://integrate.api.nvidia.com/v1",
    headers: {
      Authorization: `Bearer ${NVIDIA_NIM_API_KEY}`,
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
