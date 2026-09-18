import { createGroq } from "@ai-sdk/groq";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export const createGroqProvider = () => {
  return createGroq({
    apiKey: GROQ_API_KEY,
  });
};

export const GROQ_MODEL_CATALOG = [
  {
    modelId: "openai/gpt-oss-20b",
    modelName: "Groq: GPT-OSS 20B",
  },
  {
    modelId: "openai/gpt-oss-120b",
    modelName: "Groq: GPT-OSS 120B",
  }
];
