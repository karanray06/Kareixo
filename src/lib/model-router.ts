import { LanguageModel } from "ai";
import { quotaTracker, ProviderName } from "./quota-tracker";

import { moonshot, moonshotModels } from "./providers/moonshot";
import { openRouter, openRouterModels } from "./providers/openrouter";
import { cloudflare, cloudflareModels } from "./providers/cloudflare";
import { zai, zaiModels } from "./providers/zai";
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
  requiredEnvVars: string[];
};

export class ModelRouter {
  public providers: ProviderEntry[];
  private lastUsedIndex = -1;

  constructor(providers?: ProviderEntry[]) {
    this.providers = providers ?? [
      // ── OpenRouter (Broadest fallback) ──
      { name: "OpenRouter", modelName: "Qwen OpenRouter",       model: openRouter(openRouterModels.qwen), requiredEnvVars: ["OPENROUTER_API_KEY"] },

      // ── NVIDIA NIM Free Endpoints (best models first) ──
      { name: "NVIDIA", modelName: "Kimi K2.6",               model: nvidiaKimi(nvidiaModels.kimi_k2), requiredEnvVars: ["NVIDIA_KEY_KIMI"] },
      { name: "NVIDIA", modelName: "DeepSeek V4 Pro",         model: nvidiaDeepseek(nvidiaModels.deepseek_v4), requiredEnvVars: ["NVIDIA_KEY_DEEPSEEK"] },
      { name: "NVIDIA", modelName: "Qwen 3.5 397B",           model: nvidiaQwen(nvidiaModels.qwen_3_5), requiredEnvVars: ["NVIDIA_KEY_QWEN"] },
      { name: "NVIDIA", modelName: "Mistral Medium 3.5",      model: nvidiaMistral(nvidiaModels.mistral_medium), requiredEnvVars: ["NVIDIA_KEY_MISTRAL"] },
      { name: "NVIDIA", modelName: "MiniMax M3",              model: nvidiaMinimax(nvidiaModels.minimax_m3), requiredEnvVars: ["NVIDIA_KEY_MINIMAX"] },
      { name: "NVIDIA", modelName: "GLM 5.1",                 model: nvidiaGlm(nvidiaModels.glm_5_1), requiredEnvVars: ["NVIDIA_KEY_GLM"] },
      { name: "NVIDIA", modelName: "Gemma 4 31B",             model: nvidiaGemma(nvidiaModels.gemma_4), requiredEnvVars: ["NVIDIA_KEY_GEMMA"] },

      // ── Groq (blazing fast) ──
      { name: "Groq", modelName: "Llama 3 70B",               model: groq(groqModels.llama3), requiredEnvVars: ["GROQ_API_KEY"] },
      { name: "Groq", modelName: "Llama 3 8B",                model: groq(groqModels.llama3_8b), requiredEnvVars: ["GROQ_API_KEY"] },
      { name: "Groq", modelName: "Mixtral 8x7B",              model: groq(groqModels.mixtral), requiredEnvVars: ["GROQ_API_KEY"] },
      
      // ── Z.AI (Fast open-weight models) ──
      { name: "Z.AI", modelName: "GLM-4 Flash",               model: zai(zaiModels.glm4_flash), requiredEnvVars: ["ZAI_API_KEY"] },

      // ── Cloudflare (Workers AI) ──
      { name: "Cloudflare", modelName: "Llama 3 8B",          model: cloudflare(cloudflareModels.llama3), requiredEnvVars: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"] },

      // ── Moonshot (Kimi direct API fallback) ──
      { name: "Moonshot", modelName: "Kimi 8k",               model: moonshot(moonshotModels.v1_8k), requiredEnvVars: ["MOONSHOT_API_KEY"] },
    ];
  }

  public get allRequiredEnvVars(): string[] {
    const vars = new Set<string>();
    for (const p of this.providers) {
      for (const v of p.requiredEnvVars) {
        vars.add(v);
      }
    }
    return Array.from(vars);
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
