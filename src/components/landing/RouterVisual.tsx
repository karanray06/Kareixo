"use client";

import { useEffect, useRef, useState } from "react";

const PROVIDERS = [
  { id: "openrouter", name: "OpenRouter", x: 20, y: 30, models: "DeepSeek, Qwen, Llama" },
  { id: "nvidia", name: "NVIDIA NIM", x: 80, y: 20, models: "Nemotron, DeepSeek-R1" },
  { id: "groq", name: "Groq", x: 75, y: 70, models: "Llama, Mixtral" },
  { id: "cloudflare", name: "Cloudflare AI", x: 20, y: 75, models: "Qwen3-Coder" },
  { id: "zai", name: "Z.AI", x: 50, y: 85, models: "GLM-4.7, GLM-4.5" },
];

export default function RouterVisual() {
  const [activeProvider, setActiveProvider] = useState(0);
  const [failedProvider, setFailedProvider] = useState(-1);
  const [isRouting, setIsRouting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const cycle = () => {
      setIsRouting(true);

      // Simulate routing to provider
      setTimeout(() => {
        // Randomly fail a provider sometimes
        if (Math.random() > 0.6) {
          setFailedProvider(activeProvider);
          setTimeout(() => {
            setActiveProvider((prev) => (prev + 1) % PROVIDERS.length);
            setFailedProvider(-1);
            setIsRouting(false);
          }, 800);
        } else {
          setIsRouting(false);
        }
      }, 600);

      setActiveProvider((prev) => (prev + 1) % PROVIDERS.length);
    };

    intervalRef.current = setInterval(cycle, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeProvider]);

  return (
    <div className="section">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          How the <span className="text-gradient-cyan">free-tier router</span> works
        </h2>
        <p className="text-graphite-300 text-lg max-w-xl mx-auto">
          Your requests flow between multiple providers automatically. If one
          hits its limit, the router instantly fails over — under 2 seconds,
          completely invisible.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="glass-strong p-8 relative overflow-hidden" style={{ borderRadius: "var(--radius-lg)" }}>
          {/* Center node - the router */}
          <div className="flex items-center justify-center mb-8">
            <div
              className={`
                relative w-24 h-24 rounded-xl flex items-center justify-center
                transition-all duration-300
                ${isRouting ? "glow-cyan scale-105" : ""}
              `}
              style={{
                background: "linear-gradient(135deg, var(--cyan-700), var(--cyan-900))",
                border: "1px solid var(--cyan-500)",
              }}
            >
              <div className="text-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto text-cyan-400 mb-1"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
                <span className="text-cyan-300 text-[10px] font-mono font-bold">
                  ROUTER
                </span>
              </div>
              {isRouting && (
                <div className="absolute inset-0 rounded-xl animate-pulse-glow" />
              )}
            </div>
          </div>

          {/* Provider nodes */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {PROVIDERS.map((provider, i) => {
              const isActive = i === activeProvider;
              const isFailed = i === failedProvider;

              return (
                <div
                  key={provider.id}
                  className={`
                    relative p-3 rounded-lg text-center transition-all duration-500
                    ${
                      isFailed
                        ? "bg-red-400/10 border border-red-400/30"
                        : isActive
                        ? "glass-cyan glow-cyan scale-[1.03]"
                        : "bg-graphite-800 border border-graphite-700"
                    }
                  `}
                >
                  {/* Connection line indicator */}
                  {isActive && !isFailed && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-cyan-400 rounded-full" />
                  )}

                  <div
                    className={`text-xs font-display font-bold mb-1 transition-colors ${
                      isFailed
                        ? "text-red-400"
                        : isActive
                        ? "text-cyan-300"
                        : "text-graphite-300"
                    }`}
                  >
                    {provider.name}
                  </div>
                  <div className="text-[10px] text-graphite-500 font-mono leading-tight">
                    {provider.models}
                  </div>

                  {/* Status indicator */}
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isFailed
                          ? "bg-red-400"
                          : isActive
                          ? "bg-cyan-400 animate-pulse"
                          : "bg-graphite-600"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-mono ${
                        isFailed
                          ? "text-red-400"
                          : isActive
                          ? "text-cyan-400"
                          : "text-graphite-600"
                      }`}
                    >
                      {isFailed ? "429" : isActive ? "active" : "standby"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-graphite-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Round-robin routing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>&lt;2s failover</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>6+ free providers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
