import { LanguageModel } from "ai";
import { openRouter, openRouterModels } from "./providers/openrouter";
import { quotaTracker, ProviderName } from "./quota-tracker";

import { nvidia, nvidiaModels } from "./providers/nvidia";
import { zai, zaiModels } from "./providers/zai";
import { cloudflare, cloudflareModels } from "./providers/cloudflare";
import { groq, groqModels } from "./providers/groq";

// We'll add more providers in Phase 7. For now, OpenRouter variants act as our multi-model pool.
type ProviderEntry = {
  name: ProviderName;
  modelName: string;
  model: LanguageModel;
};

class ModelRouter {
  private providers: ProviderEntry[] = [];
  private lastUsedIndex = -1;

  constructor() {
    this.providers = [
      { name: "OpenRouter", modelName: "DeepSeek V4 Flash", model: openRouter(openRouterModels.deepseek) },
      { name: "OpenRouter", modelName: "Qwen3 Coder", model: openRouter(openRouterModels.qwen) },
      { name: "NVIDIA", modelName: "Nemotron 4", model: nvidia(nvidiaModels.nemotron) },
      { name: "Z.AI", modelName: "GLM 4 Flash", model: zai(zaiModels.glm4_flash) },
      { name: "Cloudflare", modelName: "Qwen Coder", model: cloudflare(cloudflareModels.qwen_coder) },
      { name: "Groq", modelName: "Llama 3 70B", model: groq(groqModels.llama3) },
    ];
  }

  // Get the next available provider using Round Robin, skipping rate-limited ones
  public getNextProvider(taskType: "code" | "chat" = "chat", forceProvider?: string): ProviderEntry {
    // If user forces a specific model override
    if (forceProvider) {
      const found = this.providers.find(p => p.modelName === forceProvider);
      if (found) return found;
    }

    // Try to find an available provider, checking up to N times
    for (let i = 0; i < this.providers.length; i++) {
      this.lastUsedIndex = (this.lastUsedIndex + 1) % this.providers.length;
      const candidate = this.providers[this.lastUsedIndex];

      if (!quotaTracker.shouldSkip(candidate.name)) {
        return candidate;
      }
    }

    // If ALL are skipped (rate limited), just return the first one and let it fail or hopefully succeed
    return this.providers[0];
  }

  // To be used by the route handler to handle automatic failover
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
        
        // Check if it's a rate limit error (429)
        const isRateLimit = error?.statusCode === 429 || error?.message?.includes('429');
        if (isRateLimit) {
          quotaTracker.trackRateLimit(provider.name);
        }
        
        console.warn(`Provider ${provider.name} (${provider.modelName}) failed. Attempt ${attempts}/${maxAttempts}`);
        
        if (attempts >= maxAttempts) {
          throw new Error("All AI providers are currently exhausted or rate-limited. Please try again in a few minutes.");
        }
      }
    }
    
    throw new Error("Unexpected routing failure");
  }
}

export const router = new ModelRouter();
