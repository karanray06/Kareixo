import { LanguageModel } from "ai";
import { keyPool, KeyState, PER_ATTEMPT_TIMEOUT_MS } from "./nvidia-key-pool";
import { createNvidiaProvider, NVIDIA_MODEL_CATALOG, NvidiaModelId } from "./providers/nvidia";

export type ProviderEntry = {
  name: "NVIDIA";
  modelName: string;
  modelId: NvidiaModelId;
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
  if (status === 429) return true;
  if (status !== undefined && status >= 500) return true;
  const msg = error?.message?.toLowerCase() ?? "";
  return msg.includes("429") || msg.includes("rate limit") || msg.includes("timeout");
}

export class ModelRouter {
  private modelCatalog = NVIDIA_MODEL_CATALOG;
  private lastModelIndex = -1;

  /**
   * Get the next model + key pair for a request.
   * Rotates through models round-robin, gets a key from the pool.
   */
  private getNextProvider(tier?: "fast" | "deep"): ProviderEntry {
    const keyState = keyPool.getNextKey();
    const provider = createNvidiaProvider(keyState.key);

    // Select model (round-robin through catalog)
    let modelEntry;
    if (tier === "deep") {
      // For deep analysis, prefer the best model
      modelEntry = this.modelCatalog[0];
    } else {
      this.lastModelIndex = (this.lastModelIndex + 1) % this.modelCatalog.length;
      modelEntry = this.modelCatalog[this.lastModelIndex];
    }

    return {
      name: "NVIDIA",
      modelName: modelEntry.modelName,
      modelId: modelEntry.modelId,
      model: provider(modelEntry.modelId),
      keyState,
    };
  }

  /**
   * Execute an operation with automatic failover across keys and models.
   * 
   * On failure (429, 5xx, timeout):
   * 1. Reports failure to the key pool (triggers cooldown/circuit breaker)
   * 2. Retries with the next available key
   * 3. Continues until all keys exhausted or max attempts reached
   */
  public async executeWithFailover<T>(
    operation: (provider: ProviderEntry) => Promise<T>,
    taskType: "code" | "chat" = "chat",
    tier?: "fast" | "deep"
  ): Promise<{ result: T; provider: ProviderEntry }> {
    // Max attempts = keys × 2 (allow some keys to be retried after cooldown probe)
    const maxAttempts = Math.max(keyPool.size * 2, 3);
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      const provider = this.getNextProvider(tier);
      attempts++;

      try {
        console.log(
          `[ModelRouter] Attempt ${attempts}/${maxAttempts}: ` +
          `model=${provider.modelName}, key=#${provider.keyState.index}`
        );

        const result = await withTimeout(
          operation(provider),
          PER_ATTEMPT_TIMEOUT_MS
        );

        // Success — report to pool and return
        keyPool.reportSuccess(provider.keyState);
        return { result, provider };

      } catch (error: any) {
        lastError = error;
        const statusCode = getStatusCode(error);

        console.warn(
          `[ModelRouter] Key #${provider.keyState.index} (${provider.modelName}) ` +
          `failed on attempt ${attempts}/${maxAttempts}: ` +
          `status=${statusCode || "N/A"}, message=${error?.message?.slice(0, 200)}`
        );

        if (isRetryableError(error)) {
          keyPool.reportFailure(provider.keyState, statusCode);
          // Continue to next attempt with a different key
          continue;
        }

        // Non-retryable error (e.g., 400 bad request, schema error) — don't burn more keys
        keyPool.reportFailure(provider.keyState, statusCode);
        throw error;
      }
    }

    // All attempts exhausted
    const healthSummary = keyPool.getHealthSummary();
    console.error(
      `[ModelRouter] All ${maxAttempts} attempts exhausted. Pool health:`,
      JSON.stringify(healthSummary)
    );

    throw new Error(
      `All NVIDIA API keys are currently exhausted or rate-limited after ${maxAttempts} attempts. ` +
      `Please try again in a few minutes. Last error: ${lastError?.message}`
    );
  }

  /** Get pool health for monitoring/dashboard. */
  public getPoolHealth() {
    return keyPool.getHealthSummary();
  }
}

// Singleton for use in API routes
export const router = new ModelRouter();
