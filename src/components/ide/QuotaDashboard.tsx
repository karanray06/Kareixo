"use client";

import { useState, useEffect } from "react";

type ProviderName = "OpenRouter" | "NVIDIA" | "Z.AI" | "Cloudflare" | "Groq";

interface ProviderStat {
  requestsToday: number;
  rateLimitHits: number;
  lastRateLimitAt: string | null;
}

const PROVIDER_LIMITS: Record<string, number> = {
  OpenRouter: 50,
  NVIDIA: 1000,
  "Z.AI": -1,
  Cloudflare: 100,
  Groq: 100,
};

function deriveStatus(stat: ProviderStat, max: number): "active" | "warning" | "exhausted" {
  if (stat.lastRateLimitAt) {
    const elapsed = Date.now() - new Date(stat.lastRateLimitAt).getTime();
    if (elapsed < 5 * 60 * 1000) return "exhausted";
  }
  if (max > 0 && stat.requestsToday >= max * 0.8) return "warning";
  return "active";
}

export default function QuotaDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<Record<string, ProviderStat>>({});
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silently fail — UI stays as-is
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15_000);
    return () => clearInterval(interval);
  }, []);

  const allProviders: ProviderName[] = ["OpenRouter", "NVIDIA", "Z.AI", "Cloudflare", "Groq"];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-graphite-800 border border-transparent hover:border-graphite-700 transition-colors"
        title="Provider Quotas"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-graphite-400">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <span className="text-xs font-mono text-graphite-300">Quotas</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-graphite-900 border border-graphite-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-graphite-700 bg-graphite-800 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-white">Free Tier Limits</h3>
              <p className="text-xs text-graphite-400 mt-1">Live request counts per provider</p>
            </div>
            {loading && <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />}
          </div>

          <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
            {allProviders.map((name) => {
              const stat: ProviderStat = stats[name] ?? { requestsToday: 0, rateLimitHits: 0, lastRateLimitAt: null };
              const max = PROVIDER_LIMITS[name] ?? -1;
              const status = deriveStatus(stat, max);
              return (
                <div key={name} className="p-3 rounded-md hover:bg-graphite-800 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        status === "active" ? "bg-green-400" :
                        status === "warning" ? "bg-amber-400" : "bg-red-400"
                      }`} />
                      <span className="text-xs font-bold text-graphite-200">{name}</span>
                    </div>
                    <span className="text-xs font-mono text-graphite-400">
                      {stat.requestsToday} {max > 0 ? `/ ${max}` : "reqs"}
                    </span>
                  </div>
                  {max > 0 && (
                    <div className="w-full h-1.5 bg-graphite-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          status === "active" ? "bg-green-400" :
                          status === "warning" ? "bg-amber-400" : "bg-red-400"
                        }`}
                        style={{ width: `${Math.min(100, (stat.requestsToday / max) * 100)}%` }}
                      />
                    </div>
                  )}
                  {max === -1 && (
                    <div className="text-[10px] text-graphite-500 font-mono mt-1">No listed cap</div>
                  )}
                  {status === "exhausted" && (
                    <div className="text-[10px] text-red-400 font-mono mt-1">Rate limited — skipping for 5m</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-4 py-3 border-t border-graphite-700 bg-graphite-950 text-[10px] text-graphite-500 font-mono text-center">
            Router automatically skips exhausted providers. Refreshes every 15s.
          </div>
        </div>
      )}
    </div>
  );
}
