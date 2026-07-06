"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { CpuSetting } from "iconsax-react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.router-reveal',
              opacity: [0, 1],
              translateY: [30, 0],
              delay: anime.stagger(150),
              duration: 800,
              easing: 'easeOutCubic'
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

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
    <div ref={containerRef} className="w-full h-full flex flex-col justify-center">
      <div className="w-full mx-auto router-reveal opacity-0">
        <div className="relative">
          {/* Center node - the router */}
          <div className="flex items-center justify-center mb-8">
            <div
              className={`
                relative w-24 h-24 rounded-2xl flex items-center justify-center
                transition-all duration-300 shadow-[0_10px_30px_rgba(0,191,255,0.3)]
                ${isRouting ? "scale-110 shadow-[0_10px_40px_rgba(0,191,255,0.6)]" : ""}
              `}
              style={{
                background: "linear-gradient(135deg, rgba(0,191,255,0.2), rgba(0,191,255,0.05))",
                border: "1px solid rgba(0,191,255,0.4)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="text-center">
                <CpuSetting size={32} variant="Outline" className="mx-auto text-[#00BFFF] mb-2 drop-shadow-[0_0_10px_rgba(0,191,255,0.8)]" />
                <span className="text-[#00BFFF] text-[11px] font-mono font-bold tracking-widest drop-shadow-md">
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
                    relative p-3.5 rounded-xl text-center transition-all duration-500
                    ${
                      isFailed
                        ? "bg-red-500/10 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : isActive
                        ? "bg-cyan-500/10 border border-cyan-500/30 scale-[1.05] shadow-[0_0_20px_rgba(0,191,255,0.2)]"
                        : "bg-white/5 border border-white/10"
                    }
                  `}
                >
                  {/* Connection line indicator */}
                  {isActive && !isFailed && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#00BFFF] rounded-full shadow-[0_0_10px_rgba(0,191,255,0.8)]" />
                  )}

                  <div
                    className={`text-xs font-bold mb-1 tracking-wide uppercase transition-colors ${
                      isFailed
                        ? "text-red-400"
                        : isActive
                        ? "text-[#00BFFF]"
                        : "text-white/60"
                    }`}
                  >
                    {provider.name}
                  </div>
                  <div className="text-[10px] text-white/40 font-mono leading-tight">
                    {provider.models}
                  </div>

                  {/* Status indicator */}
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isFailed
                          ? "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"
                          : isActive
                          ? "bg-[#00BFFF] shadow-[0_0_8px_rgba(0,191,255,0.8)] animate-pulse"
                          : "bg-white/20"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-mono tracking-widest uppercase ${
                        isFailed
                          ? "text-red-400"
                          : isActive
                          ? "text-[#00BFFF]"
                          : "text-white/30"
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
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/50 font-medium tracking-wide">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00BFFF] shadow-[0_0_5px_rgba(0,191,255,0.5)]" />
              <span>Round-robin routing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_5px_rgba(236,72,153,0.5)]" />
              <span>&lt;2s failover</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span>6+ free providers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
