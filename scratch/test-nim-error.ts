import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";

const nimProvider = createOpenAICompatible({
  name: "nvidia-nim-kimi",
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: "Bearer nvapi-GOOD-KEY-WAIT-I-WILL-USE-A-MOCK-OR-SOMETHING-ELSE", // Wait, if I use a bad key it will throw. If I use a mock good stream...
  },
});
