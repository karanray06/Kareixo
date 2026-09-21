/**
 * API Key Pool — Health tracking and circuit breakers for provider keys.
 *
 * Manages NVIDIA NIM and Groq keys with cooldown/circuit-breaker logic.
 */

const COOLDOWN_BASE_MS = 60_000;
const COOLDOWN_MAX_MS = 5 * 60_000;
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_COOLDOWN_MS = 3 * 60_000;
export const PER_ATTEMPT_TIMEOUT_MS = 55_000;

export type KeyState = {
  provider: "nvidia" | "groq";
  task: "chat" | "code" | "fallback";
  key: string;
  consecutiveFailures: number;
  cooldownUntil: number;
  circuitOpen: boolean;
  circuitOpenUntil: number;
  totalRequests: number;
  totalFailures: number;
};

class KeyPool {
  private nvidiaKeys: KeyState[] = [];
  private groqKeys: KeyState[] = [];
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.loadKeys();
  }

  private loadKeys(): void {
    const nvidiaKey = process.env.NVIDIA_NIM_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!nvidiaKey && !groqKey) {
      console.warn("[KeyPool] Warning: No NVIDIA NIM or Groq API keys configured.");
    }

    if (nvidiaKey) {
      const keys = nvidiaKey.split(",").map(k => k.trim()).filter(Boolean);
      this.nvidiaKeys = keys.map(k => this.createKeyState("nvidia", "code", k));
    }

    if (groqKey) {
      const keys = groqKey.split(",").map(k => k.trim()).filter(Boolean);
      this.groqKeys = keys.map(k => this.createKeyState("groq", "fallback", k));
    }

    console.log(`[KeyPool] Loaded ${this.nvidiaKeys.length} NVIDIA keys, ${this.groqKeys.length} Groq keys.`);
  }

  private createKeyState(provider: "nvidia" | "groq", task: "chat" | "code" | "fallback", key: string): KeyState {
    return {
      provider,
      task,
      key,
      consecutiveFailures: 0,
      cooldownUntil: 0,
      circuitOpen: false,
      circuitOpenUntil: 0,
      totalRequests: 0,
      totalFailures: 0,
    };
  }

  getKeyForTask(task: "chat" | "code" | "fallback", provider: "nvidia" | "groq" = "nvidia"): KeyState {
    this.ensureInitialized();
    let candidates = provider === "groq" ? this.groqKeys : this.nvidiaKeys;

    if (candidates.length === 0) {
      // Return a dummy key state to avoid crashes — the API call will fail with auth error
      return this.createKeyState(provider, task, "");
    }

    const now = Date.now();

    for (const candidate of candidates) {
      if (candidate.circuitOpen && now >= candidate.circuitOpenUntil) {
        candidate.circuitOpen = false;
        console.log(`[KeyPool] ${provider} key circuit breaker half-opened for probe.`);
      }

      if (!candidate.circuitOpen && now >= candidate.cooldownUntil) {
        return candidate;
      }
    }

    // All keys are in cooldown — return the one that will be ready soonest
    return candidates.reduce((best, c) => c.cooldownUntil < best.cooldownUntil ? c : best);
  }

  reportSuccess(keyState: KeyState): void {
    keyState.consecutiveFailures = 0;
    keyState.cooldownUntil = 0;
    keyState.circuitOpen = false;
    keyState.circuitOpenUntil = 0;
    keyState.totalRequests++;
    console.log(`[KeyPool] ${keyState.provider} key for ${keyState.task} succeeded. Total: ${keyState.totalRequests}`);
  }

  reportFailure(keyState: KeyState, statusCode?: number): void {
    const now = Date.now();
    keyState.consecutiveFailures++;
    keyState.totalFailures++;
    keyState.totalRequests++;

    const backoffMultiplier = Math.min(keyState.consecutiveFailures, 5);
    const cooldownMs = Math.min(COOLDOWN_BASE_MS * backoffMultiplier, COOLDOWN_MAX_MS);
    keyState.cooldownUntil = now + cooldownMs;

    console.warn(
      `[KeyPool] ${keyState.provider} key for ${keyState.task} failed (status=${statusCode || "unknown"}, ` +
      `consecutive=${keyState.consecutiveFailures}, cooldown=${cooldownMs}ms)`
    );

    if (keyState.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      keyState.circuitOpen = true;
      keyState.circuitOpenUntil = now + CIRCUIT_BREAKER_COOLDOWN_MS;
      console.error(
        `[KeyPool] ${keyState.provider} key for ${keyState.task} CIRCUIT BREAKER TRIPPED after ${keyState.consecutiveFailures} consecutive failures.`
      );
    }
  }

  getHealthSummary() {
    if (!this.initialized) return [];
    const now = Date.now();
    return [...this.nvidiaKeys, ...this.groqKeys].map((k) => ({
      provider: k.provider,
      task: k.task,
      available: !k.circuitOpen && now >= k.cooldownUntil,
      consecutiveFailures: k.consecutiveFailures,
      circuitOpen: k.circuitOpen,
      totalRequests: k.totalRequests,
      totalFailures: k.totalFailures,
    }));
  }
}

export const keyPool = new KeyPool();
