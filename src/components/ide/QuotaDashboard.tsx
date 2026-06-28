"use client";

import { useState, useEffect } from "react";
import { ProviderName } from "@/lib/quota-tracker";

// Mock data for the dashboard (in a real app, this would be fetched from an API route)
const MOCK_STATS: Record<ProviderName, { count: number; max: number; status: "active" | "warning" | "exhausted" }> = {
  "OpenRouter": { count: 34, max: 50, status: "warning" },
  "NVIDIA": { count: 12, max: 1000, status: "active" },
  "Z.AI": { count: 45, max: -1, status: "active" }, // -1 means unlimited
  "Cloudflare": { count: 89, max: 100, status: "warning" },
  "Groq": { count: 100, max: 100, status: "exhausted" },
};

export default function QuotaDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(MOCK_STATS);

  // Auto-refresh stats periodically (mocked)
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app: fetch('/api/stats').then(res => res.json()).then(setStats);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="px-4 py-3 border-b border-graphite-700 bg-graphite-800">
            <h3 className="font-display font-bold text-sm text-white">Free Tier Limits</h3>
            <p className="text-xs text-graphite-400 mt-1">Today&apos;s request counts per provider</p>
          </div>
          
          <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
            {Object.entries(stats).map(([name, data]) => (
              <div key={name} className="p-3 rounded-md hover:bg-graphite-800 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      data.status === "active" ? "bg-green-400" :
                      data.status === "warning" ? "bg-amber-400" : "bg-red-400"
                    }`} />
                    <span className="text-xs font-bold text-graphite-200">{name}</span>
                  </div>
                  <span className="text-xs font-mono text-graphite-400">
                    {data.count} {data.max > 0 ? `/ ${data.max}` : "reqs"}
                  </span>
                </div>
                
                {data.max > 0 && (
                  <div className="w-full h-1.5 bg-graphite-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        data.status === "active" ? "bg-green-400" :
                        data.status === "warning" ? "bg-amber-400" : "bg-red-400"
                      }`}
                      style={{ width: `${Math.min(100, (data.count / data.max) * 100)}%` }}
                    />
                  </div>
                )}
                
                {data.max === -1 && (
                  <div className="text-[10px] text-graphite-500 font-mono mt-1">
                    No listed cap
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="px-4 py-3 border-t border-graphite-700 bg-graphite-950 text-[10px] text-graphite-500 font-mono text-center">
            Router automatically skips exhausted providers.
          </div>
        </div>
      )}
    </div>
  );
}
