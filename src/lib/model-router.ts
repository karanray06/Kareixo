import { LanguageModel } from "ai";
import { quotaTracker, ProviderName } from "./quota-tracker";

import {
  nvidia, nvidiaModels,
  nvidiaMinimax, nvidiaKimi, nvidiaMistral,
  nvidiaDeepseek, nvidiaGlm, nvidiaGemma, nvidiaQwen,
} from "./providers/nvidia";

export type ProviderEntry = {
  name: ProviderName;
  modelName: string;
  model: LanguageModel;
  requiredEnvVars: string[];
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Provider timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export class ModelRouter {
  public providers: ProviderEntry[];
  public allPossibleEnvVars: string[] = [];
  private lastUsedIndex = -1;

  constructor(providers?: ProviderEntry[]) {
    this.providers = providers ?? [

      // ── NVIDIA NIM Free Endpoints (best models first) ──
      { name: "NVIDIA", modelName: "Kimi K2.6",               model: nvidiaKimi(nvidiaModels.kimi_k2), requiredEnvVars: ["NVIDIA_KEY_KIMI"] },
      { name: "NVIDIA", modelName: "Llama 3.1 70B",           model: nvidiaDeepseek(nvidiaModels.llama3_70b), requiredEnvVars: ["NVIDIA_KEY_DEEPSEEK"] },
      { name: "NVIDIA", modelName: "Nemotron 70B",            model: nvidiaQwen(nvidiaModels.nemotron_70b), requiredEnvVars: ["NVIDIA_KEY_QWEN"] },
      { name: "NVIDIA", modelName: "Mistral Large 2",         model: nvidiaMistral(nvidiaModels.mistral_large), requiredEnvVars: ["NVIDIA_KEY_MISTRAL"] },
      { name: "NVIDIA", modelName: "MiniMax M3",              model: nvidiaMinimax(nvidiaModels.minimax_m3), requiredEnvVars: ["NVIDIA_KEY_MINIMAX"] },
      { name: "NVIDIA", modelName: "Granite 3.0 8B",          model: nvidiaGlm(nvidiaModels.granite_8b), requiredEnvVars: ["NVIDIA_KEY_GLM"] },
      { name: "NVIDIA", modelName: "Nemotron 340B",           model: nvidiaGemma(nvidiaModels.nemotron_340b), requiredEnvVars: ["NVIDIA_KEY_GEMMA"] },
    ];

    const vars = new Set<string>();
    for (const p of this.providers) {
      for (const v of p.requiredEnvVars) {
        vars.add(v);
      }
    }
    this.allPossibleEnvVars = Array.from(vars);

    // Only enable providers that have all their required environment variables set
    this.providers = this.providers.filter((p) =>
      p.requiredEnvVars.every((envVar) => !!process.env[envVar])
    );
    
    // Fallback if none are configured, though the API routes usually catch this early
    if (this.providers.length === 0) {
      console.warn("[ModelRouter] No AI providers are configured. API requests will fail.");
    }
  }

  public get allRequiredEnvVars(): string[] {
    return this.allPossibleEnvVars;
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
    taskType: "code" | "chat" = "chat",
    tier?: "fast" | "deep"
  ): Promise<{ result: T; provider: ProviderEntry }> {
    const maxAttempts = this.providers.length;
    let attempts = 0;

    while (attempts < maxAttempts) {
      let provider: ProviderEntry | undefined;
      if (tier === "deep" && attempts === 0) {
        provider = this.providers.find(p => !quotaTracker.shouldSkip(p.name) && (p.modelName.includes("DeepSeek") || p.modelName.includes("Qwen")));
      }
      if (!provider) {
        provider = this.getNextProvider(taskType);
      }
      try {
        const PER_ATTEMPT_TIMEOUT_MS = 20_000;
        const result = await withTimeout(operation(provider), PER_ATTEMPT_TIMEOUT_MS);
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
