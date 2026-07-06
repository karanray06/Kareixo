"use client";

import { useState, useEffect } from "react";

/**
 * FeatureCard — exact replica of shadergradient.co Screenshots 2–4.
 * 
 * Structure:
 *  - Full-screen section
 *  - "Simply change" (left) ... frosted glass card (center) ... "to create yours" (right)
 *  - The card cycles through Kareixo features: Model, Prompts, Context, Routing
 *  - Active feature is bright white, inactive are dimmed
 *  - Each feature has a different gradient background on the card
 */

const features = [
  {
    name: "Model",
    dimmed: ["Prompts", "Context"],
    gradient: "from-emerald-400/80 via-teal-500/60 to-cyan-900/80",
  },
  {
    name: "Prompts",
    dimmed: ["Model", "Context"],
    gradient: "from-orange-400/80 via-red-500/60 to-yellow-600/80",
  },
  {
    name: "Context",
    dimmed: ["Prompts", "Routing"],
    gradient: "from-pink-500/80 via-rose-400/60 to-orange-500/80",
  },
  {
    name: "Routing",
    dimmed: ["Context", "Model"],
    gradient: "from-violet-500/80 via-purple-400/60 to-indigo-600/80",
  },
];

export default function FeatureCard() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-cycle every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const active = features[activeIndex];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden">
      {/* Top Nav — persistent "Kareixo" with underline */}
      <div className="pt-8 z-20">
        <div className="relative inline-block pb-1">
          <span className="text-white text-sm font-medium tracking-wide">Kareixo</span>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full"></div>
        </div>
      </div>

      {/* Center — "Simply change [card] to create yours" */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6">
        <span
          className="text-3xl md:text-5xl text-white/80 font-normal"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          Simply change
        </span>

        {/* Frosted glass card with cycling feature */}
        <div
          className="relative w-72 h-48 md:w-80 md:h-52 rounded-2xl overflow-hidden cursor-pointer shadow-2xl border border-white/20"
          onClick={() => setActiveIndex((prev) => (prev + 1) % features.length)}
        >
          {/* Background gradient — transitions with each feature */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${active.gradient} transition-all duration-700 ease-in-out`}
          ></div>

          {/* Glass overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>

          {/* Feature text stack */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-2">
            {/* Dimmed item above */}
            <span
              className="text-2xl md:text-3xl text-white/25 font-normal transition-all duration-500"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              {active.dimmed[0]}
            </span>

            {/* Active item */}
            <span
              className="text-4xl md:text-5xl text-white font-normal drop-shadow-lg transition-all duration-500"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              {active.name}
            </span>

            {/* Dimmed item below */}
            <span
              className="text-2xl md:text-3xl text-white/25 font-normal transition-all duration-500"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              {active.dimmed[1]}
            </span>
          </div>
        </div>

        <span
          className="text-3xl md:text-5xl text-white/80 font-normal"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          to create yours
        </span>
      </div>

      {/* Bottom pill */}
      <div className="pb-8 z-20">
        <div className="w-12 h-5 bg-white rounded-full opacity-90 shadow-lg"></div>
      </div>
    </section>
  );
}
