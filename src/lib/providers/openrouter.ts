import { createOpenAI } from "@ai-sdk/openai";

export const openRouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
    "X-Title": "Kareixo Glass Box IDE",
  },
});

export const openRouterModels = {
  deepseek: "deepseek/deepseek-chat-v4:free",
  qwen: "qwen/qwen3-coder:free",
  llama: "meta-llama/llama-3.3-70b-instruct:free",
};
