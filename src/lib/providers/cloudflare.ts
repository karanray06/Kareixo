import { createOpenAI } from "@ai-sdk/openai";

export const cloudflare = createOpenAI({
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
  apiKey: process.env.CLOUDFLARE_API_TOKEN,
});

export const cloudflareModels = {
  qwen_coder: "@hf/thebloke/qwen1.5-14b-chat-awq", // Using an available HF model via CF as an example
  llama3: "@cf/meta/llama-3-8b-instruct",
};
