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
  kimi_k2: "moonshotai/kimi-k2.6",
  minimax_m3: "minimaxai/minimax-m3",
  llama3_70b: "meta/llama-3.1-70b-instruct",
  mistral_large: "mistralai/mistral-large-2-instruct",
  nemotron_70b: "nvidia/llama-3.1-nemotron-70b-instruct",
  granite_8b: "ibm/granite-3.0-8b-instruct",
  nemotron_340b: "nvidia/nemotron-4-340b-instruct",
};
