"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";

const AXES = [
  {
    axis: "Cost model",
    kareixo: { text: "100% free — multi-provider routing across 6+ free tiers", highlight: true },
    cursor: { text: "Free tier + paid plans ($20+/mo)", highlight: false },
    antigravity: { text: "Free preview, pricing TBD", highlight: false },
    codex: { text: "Uses ChatGPT Plus ($20/mo) or API credits", highlight: false },
  },
  {
    axis: "Model lock-in",
    kareixo: { text: "Zero — auto-routes across DeepSeek, Qwen, Llama, Nemotron, GLM, and more", highlight: true },
    cursor: { text: "Primarily Claude/GPT, user can switch", highlight: false },
    antigravity: { text: "Gemini models only", highlight: false },
    codex: { text: "OpenAI models only", highlight: false },
  },
  {
    axis: "Visibility into agent decisions",
    kareixo: { text: "Full: reasoning → diff → security check → explicit approval, every time", highlight: true },
    cursor: { text: "Shows diffs, limited reasoning visibility", highlight: false },
    antigravity: { text: "Shows plans, can apply without approval", highlight: false },
    codex: { text: "Runs autonomously, shows results after", highlight: false },
  },
];

export default function ComparisonTable() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.compare-reveal',
              opacity: [0, 1],
              translateY: [30, 0],
              delay: anime.stagger(150),
              duration: 800,
              easing: 'easeOutCubic'
            });
            anime({
              targets: '.compare-row, .compare-card',
              opacity: [0, 1],
              translateY: [20, 0],
              delay: anime.stagger(100),
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

  return (
    <div ref={containerRef} className="w-full text-white">
      {/* Desktop table */}
      <div className="hidden lg:block w-full compare-reveal opacity-0">
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-5 text-white/50 font-medium w-48 uppercase tracking-widest text-xs">
                  Feature
                </th>
                <th className="text-left py-4 px-5 text-[#00BFFF] font-bold text-lg" style={{ fontFamily: "var(--font-lora), serif" }}>
                  Kareixo
                </th>
                <th className="text-left py-4 px-5 text-white/70 font-medium">
                  Cursor
                </th>
                <th className="text-left py-4 px-5 text-white/70 font-medium">
                  Antigravity
                </th>
                <th className="text-left py-4 px-5 text-white/70 font-medium">
                  Codex
                </th>
              </tr>
            </thead>
            <tbody>
              {AXES.map((row, i) => (
                <tr
                  key={row.axis}
                  className={`compare-row opacity-0 hover:bg-white/5 transition-colors ${
                    i < AXES.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <td className="py-5 px-5 text-white/90 font-medium text-sm">
                    {row.axis}
                  </td>
                  <td className="py-5 px-5">
                    <span className="text-[#00BFFF] font-medium text-sm leading-relaxed block bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                      {row.kareixo.text}
                    </span>
                  </td>
                  <td className="py-5 px-5 text-white/50 text-sm leading-relaxed">
                    {row.cursor.text}
                  </td>
                  <td className="py-5 px-5 text-white/50 text-sm leading-relaxed">
                    {row.antigravity.text}
                  </td>
                  <td className="py-5 px-5 text-white/50 text-sm leading-relaxed">
                    {row.codex.text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-6 w-full">
        {AXES.map((row) => (
          <div key={row.axis} className="bg-white/5 border border-white/10 rounded-xl p-5 compare-card opacity-0">
            <h3 className="text-lg font-bold text-white mb-4">
              {row.axis}
            </h3>
            <div className="space-y-4">
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3">
                <span className="text-xs text-[#00BFFF] font-bold tracking-widest uppercase block mb-1">
                  Kareixo
                </span>
                <span className="text-white text-sm">{row.kareixo.text}</span>
              </div>
              {[
                { name: "Cursor", data: row.cursor },
                { name: "Antigravity", data: row.antigravity },
                { name: "Codex", data: row.codex },
              ].map((comp) => (
                <div key={comp.name} className="px-4 py-2 border-l border-white/10 ml-2">
                  <span className="text-xs text-white/40 tracking-widest uppercase block mb-1">
                    {comp.name}
                  </span>
                  <span className="text-white/60 text-sm">
                    {comp.data.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
