import { createOpenAI } from "@ai-sdk/openai";

// NVIDIA NIM exposes an OpenAI-compatible endpoint
export const nvidia = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export const nvidiaModels = {
  llama3: "meta/llama3-70b-instruct",
  nemotron: "nvidia/nemotron-4-340b-instruct",
  deepseek: "deepseek-ai/deepseek-r1",
};
