import { createOpenAI } from "@ai-sdk/openai";

// Cloudflare Workers AI — OpenAI-compatible endpoint
// Docs: https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/
export const cloudflare = createOpenAI({
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
  apiKey: process.env.CLOUDFLARE_API_TOKEN,
});

export const cloudflareModels = {
  // Confirmed from Cloudflare AI model catalog (June 2025)
  qwen_coder: "@cf/qwen/qwen2.5-coder-32b-instruct", // Best free coding model on CF Workers AI
  llama3: "@cf/meta/llama-3-8b-instruct",             // Fallback general model
};
