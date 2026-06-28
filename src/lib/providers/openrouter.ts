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
  gemini: "google/gemini-2.0-flash-exp:free",
  qwen: "qwen/qwen-2.5-coder-32b-instruct:free",
  llama: "meta-llama/llama-3.3-70b-instruct:free",
};
