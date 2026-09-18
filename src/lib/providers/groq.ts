import { createGroq } from "@ai-sdk/groq";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export const createGroqProvider = () => {
  return createGroq({
    apiKey: GROQ_API_KEY,
  });
};

export const GROQ_MODEL_CATALOG = [
  {
    modelId: "llama-3.1-8b-instant",
    modelName: "Groq: LLaMA 3.1 8B Instant",
  },
  {
    modelId: "llama-3.3-70b-versatile",
    modelName: "Groq: LLaMA 3.3 70B Versatile",
  }
];
