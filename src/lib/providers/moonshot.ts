import { createOpenAI } from "@ai-sdk/openai";

export const moonshot = createOpenAI({
  baseURL: "https://api.moonshot.cn/v1",
  apiKey: process.env.MOONSHOT_API_KEY,
});

export const moonshotModels = {
  v1_8k: "moonshot-v1-8k",
  v1_32k: "moonshot-v1-32k",
};
