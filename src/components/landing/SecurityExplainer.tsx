"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import anime from "animejs";
import { Key, ShieldCross, Lock, Danger, ShieldTick } from "iconsax-react";
import { ParticleNebula, FloatingIcosahedron, GridPlane } from "./SceneElements";

const CHECKS = [
  {
    icon: <Key size={20} variant="Outline" />,
    title: "Hardcoded secrets & API keys",
    description:
      "Scans every diff for patterns matching API keys, tokens, passwords, and connection strings. Catches .env values accidentally inlined in code.",
    example: 'const apiKey = "sk-proj-abc123..."',
  },
  {
    icon: <ShieldCross size={20} variant="Outline" />,
    title: "Injection & XSS patterns",
    description:
      "Detects innerHTML assignments, unescaped template literals in HTML contexts, SQL string concatenation, and command injection vectors.",
    example: "el.innerHTML = userInput",
  },
  {
    icon: <Lock size={20} variant="Outline" />,
    title: "Missing input validation",
    description:
      "Checks user-facing forms and API endpoints for missing sanitization, type checks, and length limits on inputs.",
    example: "req.body.email used without validation",
  },
  {
    icon: <Danger size={20} variant="Outline" />,
    title: "Unsafe eval/exec usage",
    description:
      "Flags eval(), new Function(), child_process.exec with user-controlled args, and dynamic code generation from untrusted sources.",
    example: "eval(req.query.code)",
  },
];

export default function SecurityExplainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.security-reveal, .security-card',
              opacity: [0, 1],
              translateY: [30, 0],
              scale: [0.95, 1],
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
  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col justify-center">

      <div className="relative z-10 w-full">

        <div className="flex flex-col gap-4 w-full">
          {CHECKS.map((check, i) => (
            <div
              key={check.title}
              className="security-card bg-white/5 border border-white/10 rounded-xl p-4 md:p-5 group hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 opacity-0"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                  {check.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-bold text-white mb-1.5 tracking-wide">
                    {check.title}
                  </h3>
                  <p className="text-white/50 text-xs md:text-sm leading-relaxed mb-4">
                    {check.description}
                  </p>
                  <div className="font-mono text-[10px] md:text-xs bg-black/40 rounded-lg px-3 py-2 border border-red-500/20 flex items-center gap-2 group-hover:border-red-500/40 transition-colors">
                    <span className="text-red-400/80 truncate">{check.example}</span>
                    <span className="text-red-400 text-[9px] font-bold tracking-widest ml-auto bg-red-500/10 px-2 py-1 rounded">FLAGGED</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
