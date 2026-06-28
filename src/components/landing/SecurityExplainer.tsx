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
              targets: '.security-card',
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
    <div ref={containerRef} className="relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.3} />
            <ParticleNebula count={200} radius={4} color="#f59e0b" size={0.012} />
            <FloatingIcosahedron position={[3, 1, -2]} scale={0.7} color="#f59e0b" speed={0.08} />
            <GridPlane size={20} divisions={20} color="#f59e0b" opacity={0.03} position={[0, -2, 0]} />
          </Suspense>
        </Canvas>
      </div>

      <div className="section relative z-10">
        <div className="text-center mb-12">
          <div className="badge badge-amber mb-4 mx-auto">
            <ShieldTick size={12} variant="Bold" />
            PRE-COMMIT SECURITY
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Every change is <span className="text-gradient-amber">security-checked</span>
          </h2>
          <p className="text-dusk-700 text-lg max-w-2xl mx-auto">
            Before any AI-generated code is offered for your approval, a
            secondary model runs a focused security analysis. This directly
            addresses the documented finding that most AI-generated code ships
            with unreviewed security flaws.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {CHECKS.map((check, i) => (
            <div
              key={check.title}
              className="security-card card group hover:border-rosegold-500/30 transition-all opacity-0"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-rosegold-400/10 border border-rosegold-400/20 flex items-center justify-center text-rosegold-400 shrink-0 group-hover:glow-amber transition-all">
                  {check.icon}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-dusk-900 mb-1.5">
                    {check.title}
                  </h3>
                  <p className="text-dusk-500 text-sm leading-relaxed mb-3">
                    {check.description}
                  </p>
                  <div className="font-mono text-xs bg-cream-200 rounded px-3 py-2 border border-cream-300 flex items-center gap-2">
                    <span className="text-red-400/80">{check.example}</span>
                    <span className="text-rosegold-400 text-[10px] font-bold tracking-wider ml-auto">FLAGGED</span>
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
