import { LanguageModel } from "ai";
import { keyPool, KeyState, PER_ATTEMPT_TIMEOUT_MS } from "./gemini-key-pool";
import { createGeminiProvider, GEMINI_MODEL_CATALOG, GeminiModelId } from "./providers/gemini";

export type ProviderEntry = {
  name: "GEMINI";
  modelName: string;
  modelId: GeminiModelId;
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
  return msg.includes("429") || msg.includes("rate limit") || msg.includes("timeout") || msg.includes("not found");
}

export class ModelRouter {
  private modelCatalog = GEMINI_MODEL_CATALOG;

  /**
   * Get the provider configured for the specific task and tier.
   */
  private getProviderForTask(taskType: "chat" | "code", tier?: "fast" | "deep"): ProviderEntry {
    const keyState = keyPool.getKeyForTask(taskType);
    const provider = createGeminiProvider(keyState.key);

    let modelEntry;
    if (tier === "deep") {
      modelEntry = this.modelCatalog.find(m => m.modelId === "gemini-2.5-pro") || this.modelCatalog[1];
    } else {
      modelEntry = this.modelCatalog.find(m => m.modelId === "gemini-2.5-flash") || this.modelCatalog[0];
    }

    return {
      name: "GEMINI",
      modelName: modelEntry.modelName,
      modelId: modelEntry.modelId,
      model: provider(modelEntry.modelId),
      keyState,
    };
  }

  /**
   * Execute an operation with automatic retries on rate limits.
   */
  public async executeWithFailover<T>(
    operation: (provider: ProviderEntry) => Promise<T>,
    taskType: "code" | "chat" = "chat",
    tier?: "fast" | "deep"
  ): Promise<{ result: T; provider: ProviderEntry }> {
    const maxAttempts = 3;
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      const provider = this.getProviderForTask(taskType, tier);
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
          `[ModelRouter] Key for ${provider.keyState.task} (${provider.modelName}) ` +
          `failed on attempt ${attempts}/${maxAttempts}: ` +
          `status=${statusCode || "N/A"}, message=${error?.message?.slice(0, 200)}`
        );

        if (isRetryableError(error)) {
          keyPool.reportFailure(provider.keyState, statusCode);
          continue;
        }

        keyPool.reportFailure(provider.keyState, statusCode);
        throw error;
      }
    }

    const healthSummary = keyPool.getHealthSummary();
    console.error(
      `[ModelRouter] All ${maxAttempts} attempts exhausted. Pool health:`,
      JSON.stringify(healthSummary)
    );

    throw new Error(
      `Gemini API key for task '${taskType}' is exhausted or rate-limited after ${maxAttempts} attempts. ` +
      `Please try again in a few minutes. Last error: ${lastError?.message}`
    );
  }

  public getPoolHealth() {
    return keyPool.getHealthSummary();
  }
}

export const router = new ModelRouter();
