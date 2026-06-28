"use client";

import { useEffect, useRef } from "react";
// @ts-expect-error animejs types do not have a default export
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
    <div ref={containerRef} className="section">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          The axis nobody else fills
        </h2>
        <p className="text-dusk-700 text-lg max-w-xl mx-auto">
          Honest comparison on the three things that matter for trust and
          accessibility. We&apos;re not saying others are bad — we&apos;re saying
          this gap exists.
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block max-w-5xl mx-auto">
        <div className="glass-strong overflow-hidden" style={{ borderRadius: "var(--radius-lg)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-300">
                <th className="text-left py-4 px-5 text-dusk-500 font-body font-medium w-40">
                  Axis
                </th>
                <th className="text-left py-4 px-5 text-coral-400 font-display font-bold">
                  Kareixo
                </th>
                <th className="text-left py-4 px-5 text-dusk-700 font-display font-medium">
                  Cursor
                </th>
                <th className="text-left py-4 px-5 text-dusk-700 font-display font-medium">
                  Antigravity
                </th>
                <th className="text-left py-4 px-5 text-dusk-700 font-display font-medium">
                  Codex
                </th>
              </tr>
            </thead>
            <tbody>
              {AXES.map((row, i) => (
                <tr
                  key={row.axis}
                  className={`compare-row opacity-0 ${
                    i < AXES.length - 1 ? "border-b border-cream-300/50" : ""
                  }`}
                >
                  <td className="py-4 px-5 text-dusk-700 font-display font-semibold text-sm">
                    {row.axis}
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-coral-300 font-medium text-sm leading-snug block">
                      {row.kareixo.text}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-dusk-500 text-sm leading-snug">
                    {row.cursor.text}
                  </td>
                  <td className="py-4 px-5 text-dusk-500 text-sm leading-snug">
                    {row.antigravity.text}
                  </td>
                  <td className="py-4 px-5 text-dusk-500 text-sm leading-snug">
                    {row.codex.text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-6 max-w-lg mx-auto">
        {AXES.map((row) => (
          <div key={row.axis} className="card compare-card opacity-0">
            <h3 className="font-display text-lg font-bold text-dusk-900 mb-4">
              {row.axis}
            </h3>
            <div className="space-y-3">
              <div className="glass-cyan rounded-md px-3 py-2">
                <span className="text-xs text-coral-400 font-mono block mb-1">
                  Kareixo
                </span>
                <span className="text-coral-200 text-sm">{row.kareixo.text}</span>
              </div>
              {[
                { name: "Cursor", data: row.cursor },
                { name: "Antigravity", data: row.antigravity },
                { name: "Codex", data: row.codex },
              ].map((comp) => (
                <div key={comp.name} className="px-3 py-2">
                  <span className="text-xs text-dusk-500 font-mono block mb-1">
                    {comp.name}
                  </span>
                  <span className="text-dusk-500 text-sm">
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
