import { LanguageModel } from "ai";
import { keyPool, KeyState, PER_ATTEMPT_TIMEOUT_MS } from "./gemini-key-pool";
import { createGroqProvider, GROQ_MODEL_CATALOG } from "./providers/groq";
import { createNvidiaNimProvider, NVIDIA_NIM_MODEL_CATALOG } from "./providers/nvidia-nim";

export type ProviderEntry = {
  name: "GROQ" | "NVIDIA_NIM";
  modelName: string;
  modelId: string;
  model: LanguageModel;
  keyState: KeyState;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Provider timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Extract HTTP status code from various error shapes.
 */
function getStatusCode(error: any): number | undefined {
  return error?.statusCode ?? error?.status ?? error?.response?.status;
}

/**
 * Check if an error is a rate-limit or server error that warrants failover.
 */
function isRetryableError(error: any): boolean {
  const status = getStatusCode(error);
  if (status === 429 || status === 404) return true;
  if (status !== undefined && status >= 500) return true;
  const msg = error?.message?.toLowerCase() ?? "";
  return msg.includes("429") || msg.includes("rate limit") || msg.includes("rate-limit") || msg.includes("quota") || msg.includes("timeout") || msg.includes("timed out") || msg.includes("not found");
}

export class ModelRouter {
  /**
   * Get the provider configured for the specific task and tier.
   *
   * Default: NVIDIA NIM (mistral-nemotron for fast, kimi-k3 for deep)
   * Fallback: Groq
   */
  private getProviderForTask(
    taskType: "chat" | "code",
    tier: "fast" | "deep" | "fallback" = "fast",
    selectedProvider?: string
  ): ProviderEntry {
    // Explicit Groq selection or fallback tier
    if (selectedProvider === "GROQ" || tier === "fallback") {
      const provider = createGroqProvider();
      const modelEntry = tier === "deep" ? GROQ_MODEL_CATALOG[1] : GROQ_MODEL_CATALOG[0];
      const keyState = keyPool.getKeyForTask("fallback", "groq");
      return {
        name: "GROQ",
        modelName: modelEntry.modelName,
        modelId: modelEntry.modelId,
        model: provider(modelEntry.modelId) as unknown as LanguageModel,
        keyState,
      };
    }

    // Explicit model selection: NVIDIA_NIM_NEMOTRON or NVIDIA_NIM_KIMI
    if (selectedProvider === "NVIDIA_NIM_NEMOTRON") {
      const provider = createNvidiaNimProvider();
      const modelEntry = NVIDIA_NIM_MODEL_CATALOG[0]; // mistral-nemotron
      const keyState = keyPool.getKeyForTask(taskType, "nvidia");
      return {
        name: "NVIDIA_NIM",
        modelName: modelEntry.modelName,
        modelId: modelEntry.modelId,
        model: provider(modelEntry.modelId) as unknown as LanguageModel,
        keyState,
      };
    }

    if (selectedProvider === "NVIDIA_NIM_KIMI") {
      const provider = createNvidiaNimProvider();
      const modelEntry = NVIDIA_NIM_MODEL_CATALOG[1]; // kimi-k3
      const keyState = keyPool.getKeyForTask(taskType, "nvidia");
      return {
        name: "NVIDIA_NIM",
        modelName: modelEntry.modelName,
        modelId: modelEntry.modelId,
        model: provider(modelEntry.modelId) as unknown as LanguageModel,
        keyState,
      };
    }

    // Default: NVIDIA NIM — kimi-k3 for deep, mistral-nemotron for fast
    const provider = createNvidiaNimProvider();
    const modelEntry = tier === "deep"
      ? NVIDIA_NIM_MODEL_CATALOG[1]  // kimi-k3
      : NVIDIA_NIM_MODEL_CATALOG[0]; // mistral-nemotron
    const keyState = keyPool.getKeyForTask(taskType, "nvidia");

    return {
      name: "NVIDIA_NIM",
      modelName: modelEntry.modelName,
      modelId: modelEntry.modelId,
      model: provider(modelEntry.modelId) as unknown as LanguageModel,
      keyState,
    };
  }

  /**
   * Execute an operation with automatic retries on rate limits.
   *
   * Failover chain: NVIDIA NIM (deep) → NVIDIA NIM (fast) → Groq
   */
  public async executeWithFailover<T>(
    operation: (provider: ProviderEntry) => Promise<T>,
    taskType: "code" | "chat" = "chat",
    tier: "fast" | "deep" = "fast",
    selectedProvider?: string
  ): Promise<{ result: T; provider: ProviderEntry }> {
    const maxAttempts = selectedProvider ? 1 : 3;
    let attempts = 0;
    let lastError: Error | null = null;
    let currentTier: "fast" | "deep" | "fallback" = tier;

    while (attempts < maxAttempts) {
      const provider = this.getProviderForTask(taskType, currentTier, selectedProvider);
      attempts++;

      try {
        console.log(
          `[ModelRouter] Attempt ${attempts}/${maxAttempts}: ` +
          `model=${provider.modelName}, task=${provider.keyState.task}`
        );

        const result = await withTimeout(
          operation(provider),
          PER_ATTEMPT_TIMEOUT_MS
        );

        keyPool.reportSuccess(provider.keyState);
        return { result, provider };

      } catch (error: any) {
        lastError = error;
        const statusCode = getStatusCode(error);

        console.warn(
          `[ModelRouter] ${provider.modelName} ` +
          `failed on attempt ${attempts}/${maxAttempts}: ` +
          `status=${statusCode || "N/A"}, message=${error?.message?.slice(0, 200)}`
        );

        if (isRetryableError(error)) {
          keyPool.reportFailure(provider.keyState, statusCode);
          
          if (attempts === maxAttempts && currentTier === "deep") {
            console.log(`[ModelRouter] Falling back from deep tier to fast tier.`);
            currentTier = "fast";
            attempts--; // Allow one more attempt
          } else if (attempts === maxAttempts && currentTier === "fast") {
            console.log(`[ModelRouter] Falling back from NVIDIA NIM to Groq.`);
            currentTier = "fallback";
            attempts--; // Allow one more attempt with Groq
          }
          
          continue;
        }

        keyPool.reportFailure(provider.keyState, statusCode);
        throw error;
      }
    }

    const healthSummary = keyPool.getHealthSummary();
    console.error(
      `[ModelRouter] All attempts exhausted. Pool health:`,
      JSON.stringify(healthSummary)
    );

    throw new Error(
      `API key for task '${taskType}' is exhausted or rate-limited. ` +
      `Please try again in a few minutes. Last error: ${lastError?.message}`
    );
  }

  public getPoolHealth() {
    return keyPool.getHealthSummary();
  }
}

export const router = new ModelRouter();
