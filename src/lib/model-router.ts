import { LanguageModel } from "ai";
import { quotaTracker, ProviderName } from "./quota-tracker";

import { openRouter, openRouterModels } from "./providers/openrouter";
import { nvidia, nvidiaModels } from "./providers/nvidia";
import { zai, zaiModels } from "./providers/zai";
import { cloudflare, cloudflareModels } from "./providers/cloudflare";
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
      { name: "OpenRouter", modelName: "DeepSeek V4 Flash", model: openRouter(openRouterModels.deepseek) },
      { name: "OpenRouter", modelName: "Qwen3 Coder",       model: openRouter(openRouterModels.qwen) },
      { name: "NVIDIA",     modelName: "Nemotron 4",         model: nvidia(nvidiaModels.nemotron) },
      { name: "Z.AI",       modelName: "GLM 4 Flash",        model: zai(zaiModels.glm4_flash) },
      { name: "Cloudflare", modelName: "Qwen Coder",         model: cloudflare(cloudflareModels.qwen_coder) },
      { name: "Groq",       modelName: "Llama 3 70B",        model: groq(groqModels.llama3) },
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
   * The operation must actually call the provider — any error it throws
   * triggers a retry with the next provider in the round-robin list.
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
