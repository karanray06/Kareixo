import { createOpenAI } from "@ai-sdk/openai";

export const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export const groqModels = {
  llama3: "llama3-70b-8192",
  mixtral: "mixtral-8x7b-32768",
};
