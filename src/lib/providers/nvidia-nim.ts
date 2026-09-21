/**
 * NVIDIA NIM Provider — OpenAI-compatible endpoint for Zhipu GLM-5.3 and other NIM models.
 *
 * Uses @ai-sdk/openai-compatible to connect to NVIDIA's integrate API.
 * Base URL: https://integrate.api.nvidia.com/v1
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
    modelId: "z-ai/glm-5.3-flash",
    modelName: "NVIDIA NIM: GLM-5.3 Flash",
  },
  {
    modelId: "z-ai/glm-5.3",
    modelName: "NVIDIA NIM: GLM-5.3",
  },
];
