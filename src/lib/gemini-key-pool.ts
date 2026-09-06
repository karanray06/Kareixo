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
export const PER_ATTEMPT_TIMEOUT_MS = 10_000;

export type KeyState = {
  task: "chat" | "code";
  key: string;
  consecutiveFailures: number;
  cooldownUntil: number;
  circuitOpen: boolean;
  circuitOpenUntil: number;
  totalRequests: number;
  totalFailures: number;
};

class GeminiKeyPool {
  private chatKey!: KeyState;
  private codeKey!: KeyState;
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.loadKeys();
  }

  private loadKeys(): void {
    const chatKeyValue = process.env.GEMINI_API_KEY_CHAT;
    const codeKeyValue = process.env.GEMINI_API_KEY_CODE;

    if (!chatKeyValue || !codeKeyValue) {
      console.warn("[KeyPool] WARNING: Missing GEMINI_API_KEY_CHAT or GEMINI_API_KEY_CODE. Falling back to single key if available.");
    }

    const defaultKey = chatKeyValue || codeKeyValue || process.env.GEMINI_API_KEY;
    if (!defaultKey) {
      throw new Error("No Gemini API keys configured.");
    }

    this.chatKey = this.createKeyState("chat", chatKeyValue || defaultKey);
    this.codeKey = this.createKeyState("code", codeKeyValue || defaultKey);

    console.log(`[KeyPool] Loaded Gemini API keys for Chat and Code.`);
  }

  private createKeyState(task: "chat" | "code", key: string): KeyState {
    return {
      task,
      key: key.trim(),
      consecutiveFailures: 0,
      cooldownUntil: 0,
      circuitOpen: false,
      circuitOpenUntil: 0,
      totalRequests: 0,
      totalFailures: 0,
    };
  }

  getKeyForTask(task: "chat" | "code"): KeyState {
    this.ensureInitialized();
    const candidate = task === "chat" ? this.chatKey : this.codeKey;
    const now = Date.now();

    if (candidate.circuitOpen) {
      if (now >= candidate.circuitOpenUntil) {
        candidate.circuitOpen = false;
        console.log(`[KeyPool] Key for ${task} circuit breaker half-opened for probe.`);
      }
    }

    return candidate;
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
    return [this.chatKey, this.codeKey].map((k) => ({
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
