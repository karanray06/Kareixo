/**
 * NVIDIA Multi-Key Pool
 * 
 * Loads NVIDIA_API_KEY_1..N from env, provides round-robin rotation with:
 * - Per-key cooldown on 429/5xx (60s, exponential on repeat)
 * - Circuit breaker: N consecutive failures → mark unhealthy for longer cooldown
 * - Structured logging (key index only, never the value)
 * - 10s timeout per individual attempt
 * 
 * Server-side only — never import from client components.
 */

const COOLDOWN_BASE_MS = 60_000;          // 60s initial cooldown
const COOLDOWN_MAX_MS = 5 * 60_000;       // 5 min max cooldown
const CIRCUIT_BREAKER_THRESHOLD = 3;      // consecutive failures to trip breaker
const CIRCUIT_BREAKER_COOLDOWN_MS = 3 * 60_000; // 3 min breaker cooldown
export const PER_ATTEMPT_TIMEOUT_MS = 10_000;    // 10s per attempt

export type KeyState = {
  index: number;
  key: string;
  consecutiveFailures: number;
  cooldownUntil: number;      // timestamp — 0 means available
  circuitOpen: boolean;
  circuitOpenUntil: number;   // timestamp — 0 means closed
  totalRequests: number;
  totalFailures: number;
};

class NvidiaKeyPool {
  private keys: KeyState[] = [];
  private roundRobinIndex = -1;

  constructor() {
    this.loadKeys();
  }

  /** Load NVIDIA_API_KEY_1..N from environment. Fails loudly if zero keys found. */
  private loadKeys(): void {
    const keys: string[] = [];

    // Load numbered keys: NVIDIA_API_KEY_1, NVIDIA_API_KEY_2, ...
    for (let i = 1; i <= 20; i++) {
      const val = process.env[`NVIDIA_API_KEY_${i}`];
      if (val && val.trim()) {
        keys.push(val.trim());
      }
    }

    // Also accept the legacy single key as fallback
    if (keys.length === 0) {
      const legacyKey = process.env.NVIDIA_API_KEY;
      if (legacyKey && legacyKey.trim()) {
        keys.push(legacyKey.trim());
        console.warn("[KeyPool] Using legacy NVIDIA_API_KEY — migrate to NVIDIA_API_KEY_1..N for pool support.");
      }
    }

    if (keys.length === 0) {
      console.error("[KeyPool] FATAL: No NVIDIA API keys found. Set NVIDIA_API_KEY_1..N in environment.");
      throw new Error("No NVIDIA API keys configured. Set NVIDIA_API_KEY_1, NVIDIA_API_KEY_2, etc.");
    }

    this.keys = keys.map((key, index) => ({
      index: index + 1,
      key,
      consecutiveFailures: 0,
      cooldownUntil: 0,
      circuitOpen: false,
      circuitOpenUntil: 0,
      totalRequests: 0,
      totalFailures: 0,
    }));

    console.log(`[KeyPool] Loaded ${this.keys.length} NVIDIA API key(s).`);
  }

  /** Get the number of keys in the pool. */
  get size(): number {
    return this.keys.length;
  }

  /** Get the next available key via round-robin, skipping cooled-down/circuit-broken keys. */
  getNextKey(): KeyState {
    const now = Date.now();
    const total = this.keys.length;

    // Try to find an available key via round-robin
    for (let i = 0; i < total; i++) {
      this.roundRobinIndex = (this.roundRobinIndex + 1) % total;
      const candidate = this.keys[this.roundRobinIndex];

      // Check circuit breaker
      if (candidate.circuitOpen) {
        if (now >= candidate.circuitOpenUntil) {
          // Half-open: allow one attempt to see if it recovered
          candidate.circuitOpen = false;
          console.log(`[KeyPool] Key #${candidate.index} circuit breaker half-opened for probe.`);
        } else {
          continue; // Skip — circuit still open
        }
      }

      // Check cooldown
      if (now < candidate.cooldownUntil) {
        continue; // Still cooling down
      }

      return candidate;
    }

    // All keys exhausted — return the one with the earliest cooldown expiry
    const sorted = [...this.keys].sort((a, b) => {
      const aReady = Math.max(a.cooldownUntil, a.circuitOpenUntil);
      const bReady = Math.max(b.cooldownUntil, b.circuitOpenUntil);
      return aReady - bReady;
    });

    const best = sorted[0];
    console.warn(`[KeyPool] All keys cooling down. Forcing key #${best.index} (earliest recovery).`);
    return best;
  }

  /** Report a successful request for a key. */
  reportSuccess(keyState: KeyState): void {
    keyState.consecutiveFailures = 0;
    keyState.cooldownUntil = 0;
    keyState.circuitOpen = false;
    keyState.circuitOpenUntil = 0;
    keyState.totalRequests++;
    console.log(`[KeyPool] Key #${keyState.index} succeeded. Total: ${keyState.totalRequests}`);
  }

  /** Report a failed request for a key. Applies cooldown and potentially trips circuit breaker. */
  reportFailure(keyState: KeyState, statusCode?: number): void {
    const now = Date.now();
    keyState.consecutiveFailures++;
    keyState.totalFailures++;
    keyState.totalRequests++;

    const isRateLimit = statusCode === 429;
    const isServerError = statusCode !== undefined && statusCode >= 500;

    // Calculate exponential cooldown
    const backoffMultiplier = Math.min(keyState.consecutiveFailures, 5);
    const cooldownMs = Math.min(COOLDOWN_BASE_MS * backoffMultiplier, COOLDOWN_MAX_MS);
    keyState.cooldownUntil = now + cooldownMs;

    console.warn(
      `[KeyPool] Key #${keyState.index} failed (status=${statusCode || "unknown"}, ` +
      `consecutive=${keyState.consecutiveFailures}, cooldown=${cooldownMs}ms). ` +
      `${isRateLimit ? "RATE LIMITED" : isServerError ? "SERVER ERROR" : "ERROR"}`
    );

    // Trip circuit breaker if threshold exceeded
    if (keyState.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      keyState.circuitOpen = true;
      keyState.circuitOpenUntil = now + CIRCUIT_BREAKER_COOLDOWN_MS;
      console.error(
        `[KeyPool] Key #${keyState.index} CIRCUIT BREAKER TRIPPED after ${keyState.consecutiveFailures} consecutive failures. ` +
        `Locked out for ${CIRCUIT_BREAKER_COOLDOWN_MS / 1000}s.`
      );
    }
  }

  /** Get health summary for all keys (for logging/dashboards). Never exposes key values. */
  getHealthSummary(): Array<{
    index: number;
    available: boolean;
    consecutiveFailures: number;
    circuitOpen: boolean;
    totalRequests: number;
    totalFailures: number;
  }> {
    const now = Date.now();
    return this.keys.map((k) => ({
      index: k.index,
      available: !k.circuitOpen && now >= k.cooldownUntil,
      consecutiveFailures: k.consecutiveFailures,
      circuitOpen: k.circuitOpen,
      totalRequests: k.totalRequests,
      totalFailures: k.totalFailures,
    }));
  }
}

// Singleton — initialized once per serverless instance
export const keyPool = new NvidiaKeyPool();
