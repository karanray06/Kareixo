/**
 * Integration test: provider failover in model-router
 *
 * Run with: npx tsx src/__tests__/failover.test.ts
 * (No Jest setup needed — uses plain assertions)
 */
import { ModelRouter } from "../lib/model-router";
import { ProviderName } from "../lib/quota-tracker";
import { LanguageModel } from "ai";

// ── Minimal mock model factory ──────────────────────────────────────────────

function makeMockModel(name: string, shouldFail: boolean): LanguageModel {
  return {
    specificationVersion: "v1" as any,
    provider: "mock",
    modelId: name,
    doGenerate: async () => {
      if (shouldFail) {
        const err: any = new Error(`Provider ${name} rate limited`);
        err.statusCode = 429;
        throw err;
      }
      return {
        text: "pong",
        finishReason: "stop",
        usage: { promptTokens: 1, completionTokens: 1 },
        rawCall: { rawPrompt: "", rawSettings: {} },
      } as any;
    },
    doStream: async () => {
      throw new Error("Not used in probe test");
    },
  } as unknown as LanguageModel;
}

// ── Test ────────────────────────────────────────────────────────────────────

async function testFailover() {
  console.log("\n--- Failover Integration Test ---\n");

  // Build a router with provider 0 failing (429) and provider 1 succeeding
  const testRouter = new ModelRouter([
    { name: "OpenRouter" as ProviderName, modelName: "Mock-Fail", model: makeMockModel("Mock-Fail", true) },
    { name: "NVIDIA" as ProviderName, modelName: "Mock-OK", model: makeMockModel("Mock-OK", false) },
  ]);

  let resolvedProvider = "";
  const { provider } = await testRouter.executeWithFailover(async (p) => {
    // Simulate the probe: call doGenerate, will throw for failing provider
    await (p.model as any).doGenerate({ inputFormat: "messages", prompt: [{ role: "user", content: [{ type: "text", text: "ping" }] }], mode: { type: "regular" } });
    return p;
  }, "chat");

  resolvedProvider = provider.modelName;

  if (resolvedProvider !== "Mock-OK") {
    throw new Error(`FAIL: Expected Mock-OK but got ${resolvedProvider}`);
  }

  console.log(`✓ Failover worked: request fell through to "${resolvedProvider}" after Mock-Fail 429'd`);
  console.log("\n--- Test Passed ---\n");
}

testFailover().catch((err) => {
  console.error("TEST FAILED:", err.message);
  process.exit(1);
});
