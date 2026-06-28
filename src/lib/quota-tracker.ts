export type ProviderName = "OpenRouter" | "NVIDIA" | "Z.AI" | "Cloudflare" | "Groq";

interface ProviderStats {
  requestsToday: number;
  lastRequestTime: number;
  rateLimitHits: number;
}

class QuotaTracker {
  private stats: Map<ProviderName, ProviderStats>;

  constructor() {
    this.stats = new Map();
    // Initialize stats
    const providers: ProviderName[] = ["OpenRouter", "NVIDIA", "Z.AI", "Cloudflare", "Groq"];
    providers.forEach(p => {
      this.stats.set(p, {
        requestsToday: 0,
        lastRequestTime: 0,
        rateLimitHits: 0,
      });
    });
  }

  public trackSuccess(provider: ProviderName) {
    const stat = this.stats.get(provider)!;
    stat.requestsToday += 1;
    stat.lastRequestTime = Date.now();
  }

  public trackRateLimit(provider: ProviderName) {
    const stat = this.stats.get(provider)!;
    stat.rateLimitHits += 1;
    stat.lastRequestTime = Date.now();
  }

  public shouldSkip(provider: ProviderName): boolean {
    const stat = this.stats.get(provider)!;
    // Skip if we hit a rate limit within the last 5 minutes
    if (stat.rateLimitHits > 0 && Date.now() - stat.lastRequestTime < 5 * 60 * 1000) {
      return true;
    }
    return false;
  }

  public getStats() {
    return Object.fromEntries(this.stats.entries());
  }
}

// Singleton instance
export const quotaTracker = new QuotaTracker();
