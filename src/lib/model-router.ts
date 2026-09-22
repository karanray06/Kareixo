/**
 * Model Router — Determines which provider/model to use with automatic failover.
 * NVIDIA NIM is the primary, Groq is the fallback.
 */

import { createKimiProvider, createMistralProvider, NVIDIA_NIM_MODEL_CATALOG } from "./providers/nvidia-nim";
import { createGroqProvider, GROQ_MODEL_CATALOG } from "./providers/groq";
import { keyPool, KeyState } from "./gemini-key-pool";

export type RoutingTier = "deep" | "fast" | "fallback";
export type TaskType = "chat" | "code";

export interface RoutedProvider {
  provider: {
    name: "NVIDIA_KIMI" | "NVIDIA_MISTRAL" | "GROQ";
    modelId: string;
    model: any;
    supportsTools: boolean;
  };
  keyState: KeyState;
  disableTools?: boolean;
}

export class ModelRouter {
  /**
   * Main entry point for selecting a provider and model based on task/tier.
   */
  async executeWithFailover<T>(
    operation: (provider: RoutedProvider) => Promise<T>,
    task: TaskType,
    initialTier: RoutingTier = "fast"
  ): Promise<{ result: T; provider: RoutedProvider["provider"] }> {
    const MAX_RETRIES = 3;
    let attempt = 0;
    let currentTier = initialTier;
    let lastError: any = null;
    let disableTools = false;

    while (attempt < MAX_RETRIES) {
      attempt++;
      
      let providerKey: "nvidia-kimi" | "nvidia-mistral" | "groq" = "nvidia-mistral";
      if (currentTier === "deep") providerKey = "nvidia-kimi";
      else if (currentTier === "fallback") providerKey = "groq";

      const keyState = keyPool.getKeyForTask(providerKey);

      let providerInstance: RoutedProvider;
      if (providerKey === "nvidia-kimi") {
        const kimiModel = NVIDIA_NIM_MODEL_CATALOG.find((m) => m.modelId === "moonshotai/kimi-k3")!;
        const nimProvider = createKimiProvider(keyState.key);
        providerInstance = {
          provider: {
            name: "NVIDIA_KIMI",
            modelId: kimiModel.modelId,
            model: nimProvider(kimiModel.modelId),
            supportsTools: true,
          },
          keyState,
          disableTools,
        };
      } else if (providerKey === "nvidia-mistral") {
        const mistralModel = NVIDIA_NIM_MODEL_CATALOG.find((m) => m.modelId === "mistralai/mistral-nemotron")!;
        const nimProvider = createMistralProvider(keyState.key);
        providerInstance = {
          provider: {
            name: "NVIDIA_MISTRAL",
            modelId: mistralModel.modelId,
            model: nimProvider(mistralModel.modelId),
            supportsTools: true,
          },
          keyState,
          disableTools,
        };
      } else {
        const groqModel = GROQ_MODEL_CATALOG[0]; // fallback to first Groq model
        const groqProvider = createGroqProvider();
        providerInstance = {
          provider: {
            name: "GROQ",
            modelId: groqModel.modelId,
            model: groqProvider(groqModel.modelId),
            supportsTools: false, // assuming Groq models might not support complex tools
          },
          keyState,
          disableTools,
        };
      }

      console.log(`[ModelRouter] Attempt ${attempt}/${MAX_RETRIES}: model=${providerInstance.provider.modelId}, task=${task}`);

      try {
        // Pre-flight health check to ensure provider is responsive (especially for streams)
        const baseUrl = providerKey === "groq" 
          ? "https://api.groq.com/openai/v1/models" 
          : "https://integrate.api.nvidia.com/v1/models";
          
        const ping = await fetch(baseUrl, {
          headers: { Authorization: `Bearer ${keyState.key}` },
          signal: AbortSignal.timeout(3500) // 3.5s timeout for health check
        });

        if (!ping.ok) {
          throw new Error(`Health check failed with status ${ping.status}`);
        }

        const result = await operation(providerInstance);
        keyPool.reportSuccess(keyState);
        return { result, provider: providerInstance.provider };
      } catch (error: any) {
        lastError = error;
        keyPool.reportFailure(keyState, error?.statusCode);

        console.warn(`[ModelRouter] Provider ${providerInstance.provider.name} failed:`, error?.message || error);

        if (error.name === 'NoSuchToolError' || error.message?.includes('tool')) {
          console.warn(`[ModelRouter] Tool error encountered with ${providerInstance.provider.name}. Disabling tools for retries.`);
          disableTools = true;
          // Don't throw — continue downgrade failover without tools
        }

        // Tier downgrade logic on failure
        if (currentTier === "deep") {
          console.log("[ModelRouter] Downgrading to 'fast' tier.");
          currentTier = "fast";
        } else if (currentTier === "fast") {
          console.log("[ModelRouter] Downgrading to 'fallback' tier (Groq).");
          currentTier = "fallback";
        } else {
          console.log("[ModelRouter] Fallback failed. Retrying fallback.");
        }

        const delay = attempt * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw new Error(`Model Router exhausted all retries. Last error: ${lastError?.message}`);
  }
}

export const router = new ModelRouter();
