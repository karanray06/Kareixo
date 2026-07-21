import { createOpenAI } from "@ai-sdk/openai";

// NVIDIA NIM exposes an OpenAI-compatible endpoint
// Each model uses its own API key for maximum free quota usage
export const nvidia = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

// Provider instances with per-model keys for free endpoint models
export const nvidiaMinimax = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_KEY_MINIMAX,
});

export const nvidiaKimi = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_KEY_KIMI,
});

export const nvidiaMistral = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_KEY_MISTRAL,
});

export const nvidiaDeepseek = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_KEY_DEEPSEEK,
});

export const nvidiaGlm = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_KEY_GLM,
});

export const nvidiaGemma = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_KEY_GEMMA,
});

export const nvidiaQwen = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_KEY_QWEN,
});

export const nvidiaModels = {
  // Model IDs verified as of July 2024
  kimi_k2: "moonshotai/kimi-k2.6",
  minimax_m3: "minimaxai/minimax-m3",
  deepseek_v4: "deepseek-ai/deepseek-v4-pro",
  mistral_medium: "mistralai/mistral-medium-3.5-128b",
  qwen_3_5: "qwen/qwen3.5-397b-a17b",
  glm_5_1: "z-ai/glm-5.1",
  gemma_4: "google/gemma-4-31b-it",
};
