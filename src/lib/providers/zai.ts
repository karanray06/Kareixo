import { createOpenAI } from "@ai-sdk/openai";

export const zai = createOpenAI({
  baseURL: "https://api.z.ai/v1", // Adjust based on actual Z.AI docs
  apiKey: process.env.ZAI_API_KEY,
});

export const zaiModels = {
  glm4_flash: "glm-4-flash",
  glm4_5_flash: "glm-4.5-flash",
};
