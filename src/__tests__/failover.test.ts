/**
 * Integration test: NVIDIA multi-key failover
 *
 * Tests that the model router correctly fails over between keys when one
 * returns 429 or times out.
 *
 * Run with: npx vitest run src/__tests__/failover.test.ts
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the key pool before importing the router
vi.mock("../lib/nvidia-key-pool", () => {
  let callIndex = 0;
  const mockKeys = [
    {
      index: 1, key: "fake-key-1", consecutiveFailures: 0,
      cooldownUntil: 0, circuitOpen: false, circuitOpenUntil: 0,
      totalRequests: 0, totalFailures: 0,
    },
    {
      index: 2, key: "fake-key-2", consecutiveFailures: 0,
      cooldownUntil: 0, circuitOpen: false, circuitOpenUntil: 0,
      totalRequests: 0, totalFailures: 0,
    },
  ];

  return {
    PER_ATTEMPT_TIMEOUT_MS: 5000,
    keyPool: {
      size: 2,
      getNextKey: () => {
        const key = mockKeys[callIndex % mockKeys.length];
        callIndex++;
        return key;
      },
      reportSuccess: vi.fn(),
      reportFailure: vi.fn(),
      getHealthSummary: () => mockKeys.map(k => ({
        index: k.index, available: true,
        consecutiveFailures: k.consecutiveFailures,
        circuitOpen: false, totalRequests: k.totalRequests,
        totalFailures: k.totalFailures,
      })),
    },
  };
});

// Mock the NVIDIA provider
vi.mock("../lib/providers/nvidia", () => ({
  createNvidiaProvider: (apiKey: string) => (modelId: string) => ({
    specificationVersion: "v1",
    provider: "mock-nvidia",
    modelId,
    apiKey, // expose for testing which key was used
    doGenerate: async () => {
      if (apiKey === "fake-key-1") {
        const err: any = new Error("Rate limited");
        err.statusCode = 429;
        throw err;
      }
      return {
        text: "reviewed",
        finishReason: "stop",
        usage: { promptTokens: 1, completionTokens: 1 },
        rawCall: { rawPrompt: "", rawSettings: {} },
      };
    },
    doStream: async () => ({
      stream: new ReadableStream({
        start(controller) {
          if (apiKey === "fake-key-1") {
            const err: any = new Error("Rate limited");
            err.statusCode = 429;
            controller.enqueue({ type: "error", error: err });
          } else {
            controller.enqueue({ type: "text-delta", textDelta: "pong" });
          }
          controller.close();
        },
      }),
      rawCall: { rawPrompt: "", rawSettings: {} },
    }),
  }),
  NVIDIA_MODEL_CATALOG: [
    { modelName: "Test Model", modelId: "test/model-1" },
  ],
}));

describe("Multi-key failover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail over from key #1 (429) to key #2 (success)", async () => {
    const { ModelRouter } = await import("../lib/model-router");
    const testRouter = new ModelRouter();

    const { provider } = await testRouter.executeWithFailover(async (p) => {
      await (p.model as any).doGenerate({
        inputFormat: "messages",
        prompt: [{ role: "user", content: [{ type: "text", text: "ping" }] }],
        mode: { type: "regular" },
      });
      return "success";
    }, "chat");

    // Key #1 failed with 429, so the result should come from key #2
    expect(provider.keyState.index).toBe(2);
  });

  it("should fail over during streaming when key #1 returns error chunk", async () => {
    const { ModelRouter } = await import("../lib/model-router");
    const testRouter = new ModelRouter();

    const { provider } = await testRouter.executeWithFailover(async (p) => {
      const res = await (p.model as any).doStream({
        inputFormat: "messages",
        prompt: [{ role: "user", content: [{ type: "text", text: "ping" }] }],
        mode: { type: "regular" },
      });
      const reader = res.stream.getReader();
      const firstChunk = await reader.read();
      if (firstChunk.value && firstChunk.value.type === "error") {
        throw firstChunk.value.error;
      }
      return "streamed";
    }, "chat");

    expect(provider.keyState.index).toBe(2);
  });
});
