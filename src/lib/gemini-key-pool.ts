/**
 * Gemini Task-Based Key Pool
 * 
 * Uses GEMINI_API_KEY_CHAT for chat tasks and GEMINI_API_KEY_CODE for code review tasks.
 * Retains health tracking and circuit breakers.
 */

const COOLDOWN_BASE_MS = 60_000;
const COOLDOWN_MAX_MS = 5 * 60_000;
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_COOLDOWN_MS = 3 * 60_000;
export const PER_ATTEMPT_TIMEOUT_MS = 55_000;

export type KeyState = {
  provider: "gemini" | "pollinations";
  task: "chat" | "code" | "fallback";
  key: string;
  consecutiveFailures: number;
  cooldownUntil: number;
  circuitOpen: boolean;
  circuitOpenUntil: number;
  totalRequests: number;
  totalFailures: number;
};

class GeminiKeyPool {
  private chatKeys: KeyState[] = [];
  private codeKeys: KeyState[] = [];
  private pollinationsKeys: KeyState[] = [];
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.loadKeys();
  }

  private loadKeys(): void {
    const chatKeyValue = process.env.GEMINI_API_KEY_CHAT;
    const codeKeyValue = process.env.GEMINI_API_KEY_CODE;
    const pollinationsKeyValue = process.env.POLLINATIONS_API_KEY;

    if (!chatKeyValue && !codeKeyValue && !process.env.GEMINI_API_KEY && !pollinationsKeyValue) {
      throw new Error("No API keys configured.");
    }

    const defaultKeys = (process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
    const chatKeysInput = chatKeyValue ? chatKeyValue.split(",").map(k => k.trim()).filter(Boolean) : defaultKeys;
    const codeKeysInput = codeKeyValue ? codeKeyValue.split(",").map(k => k.trim()).filter(Boolean) : defaultKeys;
    const pollinationsKeysInput = pollinationsKeyValue ? pollinationsKeyValue.split(",").map(k => k.trim()).filter(Boolean) : [];

    if (chatKeysInput.length === 0 || codeKeysInput.length === 0) {
      console.warn("[KeyPool] Warning: No Gemini API keys configured.");
    }

    this.chatKeys = chatKeysInput.map(k => this.createKeyState("gemini", "chat", k));
    this.codeKeys = codeKeysInput.map(k => this.createKeyState("gemini", "code", k));
    this.pollinationsKeys = pollinationsKeysInput.map(k => this.createKeyState("pollinations", "fallback", k));

    console.log(`[KeyPool] Loaded ${this.chatKeys.length} Chat keys, ${this.codeKeys.length} Code keys, and ${this.pollinationsKeys.length} Pollinations keys.`);
  }

  private createKeyState(provider: "gemini" | "pollinations", task: "chat" | "code" | "fallback", key: string): KeyState {
    return {
      provider,
      task,
      key: key,
      consecutiveFailures: 0,
      cooldownUntil: 0,
      circuitOpen: false,
      circuitOpenUntil: 0,
      totalRequests: 0,
      totalFailures: 0,
    };
  }

  getKeyForTask(task: "chat" | "code" | "fallback", provider: "gemini" | "pollinations" = "gemini"): KeyState {
    this.ensureInitialized();
    let candidates = this.chatKeys;
    if (provider === "pollinations") {
      candidates = this.pollinationsKeys;
    } else if (task === "code") {
      candidates = this.codeKeys;
    }
    const now = Date.now();

    let bestCandidate: KeyState | null = null;

    for (const candidate of candidates) {
      if (candidate.circuitOpen && now >= candidate.circuitOpenUntil) {
        candidate.circuitOpen = false;
        console.log(`[KeyPool] Key for ${task} circuit breaker half-opened for probe.`);
      }

      if (!candidate.circuitOpen && now >= candidate.cooldownUntil) {
        return candidate;
      }

      if (!bestCandidate || candidate.cooldownUntil < bestCandidate.cooldownUntil) {
        bestCandidate = candidate;
      }
    }

    return bestCandidate!;
  }

  reportSuccess(keyState: KeyState): void {
    keyState.consecutiveFailures = 0;
    keyState.cooldownUntil = 0;
    keyState.circuitOpen = false;
    keyState.circuitOpenUntil = 0;
    keyState.totalRequests++;
    console.log(`[KeyPool] Key for ${keyState.task} succeeded. Total: ${keyState.totalRequests}`);
  }

  reportFailure(keyState: KeyState, statusCode?: number): void {
    const now = Date.now();
    keyState.consecutiveFailures++;
    keyState.totalFailures++;
    keyState.totalRequests++;

    const isRateLimit = statusCode === 429;
    const isServerError = statusCode !== undefined && statusCode >= 500;

    const backoffMultiplier = Math.min(keyState.consecutiveFailures, 5);
    const cooldownMs = Math.min(COOLDOWN_BASE_MS * backoffMultiplier, COOLDOWN_MAX_MS);
    keyState.cooldownUntil = now + cooldownMs;

    console.warn(
      `[KeyPool] Key for ${keyState.task} failed (status=${statusCode || "unknown"}, ` +
      `consecutive=${keyState.consecutiveFailures}, cooldown=${cooldownMs}ms). ` +
      `${isRateLimit ? "RATE LIMITED" : isServerError ? "SERVER ERROR" : "ERROR"}`
    );

    if (keyState.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      keyState.circuitOpen = true;
      keyState.circuitOpenUntil = now + CIRCUIT_BREAKER_COOLDOWN_MS;
      console.error(
        `[KeyPool] Key for ${keyState.task} CIRCUIT BREAKER TRIPPED after ${keyState.consecutiveFailures} consecutive failures.`
      );
    }
  }

  getHealthSummary() {
    if (!this.initialized) return [];
    const now = Date.now();
    return [...this.chatKeys, ...this.codeKeys, ...this.pollinationsKeys].map((k) => ({
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

export const keyPool = new GeminiKeyPool();
