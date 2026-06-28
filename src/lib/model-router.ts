import { LanguageModel } from "ai";
import { quotaTracker, ProviderName } from "./quota-tracker";

import { moonshot, moonshotModels } from "./providers/moonshot";
import {
  nvidia, nvidiaModels,
  nvidiaMinimax, nvidiaKimi, nvidiaMistral,
  nvidiaDeepseek, nvidiaGlm, nvidiaGemma, nvidiaQwen,
} from "./providers/nvidia";
import { groq, groqModels } from "./providers/groq";

export type ProviderEntry = {
  name: ProviderName;
  modelName: string;
  model: LanguageModel;
};

export class ModelRouter {
  private providers: ProviderEntry[];
  private lastUsedIndex = -1;

  constructor(providers?: ProviderEntry[]) {
    this.providers = providers ?? [
      // ── NVIDIA NIM Free Endpoints (best models first) ──
      { name: "NVIDIA", modelName: "Kimi K2.6",             model: nvidiaKimi(nvidiaModels.kimi_k2) },
      { name: "NVIDIA", modelName: "DeepSeek V4 Pro",       model: nvidiaDeepseek(nvidiaModels.deepseek_v4) },
      { name: "NVIDIA", modelName: "Qwen 3.5 397B",         model: nvidiaQwen(nvidiaModels.qwen_3_5) },
      { name: "NVIDIA", modelName: "Mistral Medium 3.5",    model: nvidiaMistral(nvidiaModels.mistral_medium) },
      { name: "NVIDIA", modelName: "MiniMax M3",            model: nvidiaMinimax(nvidiaModels.minimax_m3) },
      { name: "NVIDIA", modelName: "GLM 5.1",               model: nvidiaGlm(nvidiaModels.glm_5_1) },
      { name: "NVIDIA", modelName: "Gemma 4 31B",           model: nvidiaGemma(nvidiaModels.gemma_4) },

      // ── Groq (blazing fast) ──
      { name: "Groq", modelName: "Llama 3 70B",             model: groq(groqModels.llama3) },
      { name: "Groq", modelName: "Llama 3 8B",              model: groq(groqModels.llama3_8b) },
      { name: "Groq", modelName: "Mixtral 8x7B",            model: groq(groqModels.mixtral) },

      // ── Moonshot (Kimi direct API fallback) ──
      { name: "Moonshot", modelName: "Kimi 8k",             model: moonshot(moonshotModels.v1_8k) },
    ];
  }

  /** Round-robin, skipping rate-limited providers */
  public getNextProvider(taskType: "code" | "chat" = "chat", forceProvider?: string): ProviderEntry {
    if (forceProvider) {
      const found = this.providers.find((p) => p.modelName === forceProvider);
      if (found) return found;
    }
    for (let i = 0; i < this.providers.length; i++) {
      this.lastUsedIndex = (this.lastUsedIndex + 1) % this.providers.length;
      const candidate = this.providers[this.lastUsedIndex];
      if (!quotaTracker.shouldSkip(candidate.name)) return candidate;
    }
    return this.providers[0];
  }

  /**
   * Execute `operation` with automatic failover across all providers.
   */
  public async executeWithFailover<T>(
    operation: (provider: ProviderEntry) => Promise<T>,
    taskType: "code" | "chat" = "chat"
  ): Promise<{ result: T; provider: ProviderEntry }> {
    const maxAttempts = this.providers.length;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const provider = this.getNextProvider(taskType);
      try {
        const result = await operation(provider);
        quotaTracker.trackSuccess(provider.name);
        return { result, provider };
      } catch (error: any) {
        attempts++;
        const isRateLimit =
          error?.statusCode === 429 ||
          error?.status === 429 ||
          error?.message?.includes("429") ||
          error?.message?.toLowerCase().includes("rate limit");

        if (isRateLimit) {
          quotaTracker.trackRateLimit(provider.name);
        }

        console.warn(
          `[ModelRouter] Provider ${provider.name} (${provider.modelName}) failed on attempt ${attempts}/${maxAttempts}: ${error?.message}`
        );

        if (attempts >= maxAttempts) {
          throw new Error(
            "All AI providers are currently exhausted or rate-limited. Please try again in a few minutes."
          );
        }
      }
    }

    throw new Error("Unexpected routing failure");
  }
}

// Singleton for use in API routes
export const router = new ModelRouter();
