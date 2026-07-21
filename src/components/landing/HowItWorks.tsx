"use client";

/**
 * HowItWorks — A three-step walkthrough showing the Kareixo agent flow.
 * 
 * Step 1: Describe what you want
 * Step 2: Agent plans & executes
 * Step 3: Review, approve, ship
 */

import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Describe what you want",
    description: "Write a natural-language prompt — \"add dark mode\", \"refactor the auth flow\", or \"fix the race condition in useChat\". Kareixo understands project context automatically.",
    visual: (
      <div className="bg-black/40 rounded-xl border border-white/10 p-6 font-mono text-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="text-white/40 mb-2">{">"} Agent</div>
        <div className="text-white/80 leading-relaxed">
          <span className="text-[#ff5005]">@kareixo</span>{" "}
          Add a dark mode toggle to the settings page. Use the existing design tokens and persist the preference in localStorage.
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff5005] animate-pulse" />
          <span className="text-white/30 text-xs">Planning...</span>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Agent plans & executes",
    description: "The planner decomposes your request into ordered file-level tasks. Each task is routed to the best available model, executed, and security-scanned — all without you lifting a finger.",
    visual: (
      <div className="bg-black/40 rounded-xl border border-white/10 p-6 font-mono text-sm space-y-3">
        <div className="flex items-center gap-3 text-green-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          <span className="text-white/60">src/lib/theme.ts</span>
          <span className="text-white/20 text-xs ml-auto">Gemma 4 · 1.2s</span>
        </div>
        <div className="flex items-center gap-3 text-green-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          <span className="text-white/60">src/components/ThemeToggle.tsx</span>
          <span className="text-white/20 text-xs ml-auto">Kimi K2 · 2.1s</span>
        </div>
        <div className="flex items-center gap-3 text-[#ff5005]">
          <div className="w-3.5 h-3.5 border-2 border-[#ff5005] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/60">src/app/settings/page.tsx</span>
          <span className="text-white/20 text-xs ml-auto">Running...</span>
        </div>
        <div className="flex items-center gap-3 text-white/20">
          <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
          <span>src/app/layout.tsx</span>
          <span className="text-xs ml-auto">Pending</span>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Review, approve, ship",
    description: "Every change passes through a static security scanner before you see it. Review the diff, approve with one click, and push directly to GitHub — or reject and iterate.",
    visual: (
      <div className="bg-black/40 rounded-xl border border-white/10 p-6 font-mono text-sm space-y-4">
        <div className="flex items-center gap-2 text-green-400 text-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Security scan passed — 0 issues found
        </div>
        <div className="bg-black/40 rounded-lg p-3 border border-white/5 text-xs">
          <div className="text-red-400/80">- {"  "}const theme = &quot;light&quot;;</div>
          <div className="text-green-400/80">+ {"  "}const theme = useThemePreference();</div>
          <div className="text-white/30">{"  "}return {"<"}ThemeProvider value={"{"}theme{"}"}{">"}</div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 bg-[#ff5005] rounded-lg text-white text-xs font-medium">Apply all</button>
          <button className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs">Push to GitHub</button>
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section className="max-w-[1400px] mx-auto px-6 md:px-12">
      <div className="text-center mb-16">
        <h2
          className="text-4xl md:text-5xl text-white font-normal drop-shadow-2xl"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          How it <span className="text-white/50 italic">works</span>
        </h2>
        <p className="text-white/40 mt-4 max-w-lg mx-auto font-medium tracking-wide">
          Three steps from idea to shipped code — no context switching.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: Step selectors */}
        <div className="lg:w-2/5 flex flex-col gap-4">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`text-left p-6 rounded-2xl border transition-all duration-300 ${
                active === i
                  ? "bg-white/5 border-white/10 shadow-[0_0_40px_rgba(255,80,5,0.08)]"
                  : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5"
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <span className={`text-xs font-mono tracking-widest ${active === i ? "text-[#ff5005]" : "text-white/20"}`}>
                  {step.number}
                </span>
                <h3 className={`text-lg font-medium transition-colors ${active === i ? "text-white" : "text-white/40"}`}>
                  {step.title}
                </h3>
              </div>
              <p className={`text-sm leading-relaxed transition-colors ${active === i ? "text-white/60" : "text-white/20"}`}>
                {step.description}
              </p>
            </button>
          ))}
        </div>

        {/* Right: Visual */}
        <div className="lg:w-3/5 sticky top-32">
          <div className="p-0.5 rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-black/60 backdrop-blur-3xl rounded-[calc(2rem-1px)] p-8 md:p-10 border border-white/5 shadow-inner min-h-[300px] flex items-center">
              <div className="w-full transition-all duration-500">
                {steps[active].visual}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
