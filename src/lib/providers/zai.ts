import { createOpenAI } from "@ai-sdk/openai";

// Base URL confirmed from Z.AI developer docs: https://api.z.ai
// Use /api/paas/v4 for general API access.
// Use /api/coding/paas/v4 if you have subscribed to the GLM Coding Plan.
export const zai = createOpenAI({
  baseURL: "https://api.z.ai/api/paas/v4",
  apiKey: process.env.ZAI_API_KEY,
});

export const zaiModels = {
  // Confirmed current free model IDs from Z.AI docs (June 2025)
  glm4_flash: "glm-4-flash",       // Stable free-tier model
  glm4_7_flash: "glm-4.7-flash",  // Latest free flash variant
};
