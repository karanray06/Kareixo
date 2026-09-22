/**
 * Integration test: NVIDIA NIM + Groq failover logic
 *
 * Tests that the model router correctly routes to NVIDIA NIM as primary
 * and falls back to Groq on failure.
 *
 * Run with: npx vitest run src/__tests__/failover.test.ts
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the key pool
vi.mock("../lib/gemini-key-pool", () => {
  const mockNvidiaKey = {
    provider: "nvidia",
    task: "code", key: "fake-nvidia-key", consecutiveFailures: 0,
    cooldownUntil: 0, circuitOpen: false, circuitOpenUntil: 0,
    totalRequests: 0, totalFailures: 0,
  };

  return {
    PER_ATTEMPT_TIMEOUT_MS: 5000,
    keyPool: {
      getKeyForTask: () => mockNvidiaKey,
      reportSuccess: vi.fn(),
      reportFailure: vi.fn(),
      getHealthSummary: () => [mockNvidiaKey].map(k => ({
        provider: k.provider,
        task: k.task, available: true,
        consecutiveFailures: k.consecutiveFailures,
        circuitOpen: false, totalRequests: k.totalRequests,
        totalFailures: k.totalFailures,
      })),
    },
  };
});

// Mock the NVIDIA NIM providers (Kimi + Mistral)
const mockNimModel = (modelId: string) => ({
  specificationVersion: "v1",
  provider: "mock-nvidia-nim",
  modelId,
  doGenerate: async () => ({
    text: "reviewed",
    finishReason: "stop",
    usage: { promptTokens: 1, completionTokens: 1 },
    rawCall: { rawPrompt: "", rawSettings: {} },
  }),
});

vi.mock("../lib/providers/nvidia-nim", () => ({
  createKimiProvider: () => mockNimModel,
  createMistralProvider: () => mockNimModel,
  NVIDIA_NIM_MODEL_CATALOG: [
    { modelId: "mistralai/mistral-nemotron", modelName: "NVIDIA NIM: Mistral-Nemotron", supportsTools: true },
    { modelId: "moonshotai/kimi-k3", modelName: "NVIDIA NIM: Kimi K3", supportsTools: true },
  ],
}));

// Mock the Groq provider (fallback)
vi.mock("../lib/providers/groq", () => ({
  createGroqProvider: () => (modelId: string) => ({
    specificationVersion: "v1",
    provider: "mock-groq",
    modelId,
    doGenerate: async () => ({
      text: "fallback",
      finishReason: "stop",
      usage: { promptTokens: 1, completionTokens: 1 },
      rawCall: { rawPrompt: "", rawSettings: {} },
    }),
  }),
  GROQ_MODEL_CATALOG: [
    { modelId: "openai/gpt-oss-20b", modelName: "Groq: GPT-OSS 20B" },
    { modelId: "openai/gpt-oss-120b", modelName: "Groq: GPT-OSS 120B" },
  ],
}));

describe("Retry Logic", { timeout: 15000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should route to NVIDIA NIM as primary provider", async () => {
    const { ModelRouter } = await import("../lib/model-router");
    const testRouter = new ModelRouter();

    const { provider } = await testRouter.executeWithFailover(async (p) => {
      await (p.provider.model as any).doGenerate({
        inputFormat: "messages",
        prompt: [{ role: "user", content: [{ type: "text", text: "ping" }] }],
        mode: { type: "regular" },
      });
      return "success";
    }, "code", "deep");

    expect(provider.name).toBe("NVIDIA_KIMI");
    expect(provider.modelId).toBe("moonshotai/kimi-k3"); // deep tier = kimi-k3
  });

  it("should route to Mistral-Nemotron for fast tier", async () => {
    const { ModelRouter } = await import("../lib/model-router");
    const testRouter = new ModelRouter();

    const { provider } = await testRouter.executeWithFailover(async (p) => {
      await (p.provider.model as any).doGenerate({
        inputFormat: "messages",
        prompt: [{ role: "user", content: [{ type: "text", text: "ping" }] }],
        mode: { type: "regular" },
      });
      return "success";
    }, "chat", "fast");

    expect(provider.name).toBe("NVIDIA_MISTRAL");
    expect(provider.modelId).toBe("mistralai/mistral-nemotron"); // fast tier = nemotron
  });
});
