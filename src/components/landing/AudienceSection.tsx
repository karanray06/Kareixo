"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleNebula, FloatingOctahedron, FloatingTorus } from "./SceneElements";

const AUDIENCES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: "Students",
    description:
      "Learn to code with an AI assistant that explains its reasoning — not just generates code. Zero cost means zero barriers.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Indie hackers",
    description:
      "Ship your side project with AI assistance before you've earned your first dollar. No subscription to cancel if the project doesn't work out.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <path d="M13 6h3a2 2 0 0 1 2 2v7" />
        <path d="M11 18H8a2 2 0 0 1-2-2V9" />
      </svg>
    ),
    title: "Open-source contributors",
    description:
      "Review AI suggestions with the same rigor you'd review a pull request. Full diff visibility and security checks, not blind trust.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Curious builders",
    description:
      "Prototype faster, understand deeper. The 'explain mode' helps you learn why code works, not just that it works.",
  },
];

export default function AudienceSection() {
  return (
    <div className="relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.3} />
            <ParticleNebula count={300} radius={5} color="#4dd8d0" size={0.015} />
            <FloatingOctahedron position={[-3, 1, -2]} scale={0.5} color="#4dd8d0" speed={0.1} />
            <FloatingTorus position={[3, -1, -1]} scale={0.3} color="#f59e0b" speed={0.08} />
          </Suspense>
        </Canvas>
      </div>

      <div className="section relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Built for builders with{" "}
            <span className="text-gradient-cyan">zero budget</span>
          </h2>
          <p className="text-dusk-700 text-lg max-w-xl mx-auto">
            We&apos;re not hiding who this is for. If you can&apos;t afford $20/month
            for AI tooling, you are exactly our user.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto mb-16">
          {AUDIENCES.map((audience, i) => (
            <div
              key={audience.title}
              className="card hover:border-coral-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-coral-400/10 border border-coral-400/20 flex items-center justify-center text-coral-400 mb-4 group-hover:glow-cyan transition-all">
                {audience.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-dusk-900 mb-2">
                {audience.title}
              </h3>
              <p className="text-dusk-500 text-sm leading-relaxed">
                {audience.description}
              </p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div
            className="glass-strong inline-block px-12 py-10 text-center"
            style={{ borderRadius: "var(--radius-xl)" }}
          >
            <h3 className="font-display text-2xl md:text-4xl font-bold mb-3">
              Start building — no card, no signup limits
            </h3>
            <p className="text-dusk-500 text-base mb-6 max-w-md mx-auto">
              Your projects sync everywhere, free. See exactly what the AI does
              and why, every time.
            </p>
            <a
              href="/signup"
              className="btn btn-primary text-lg px-10 py-3.5 inline-flex"
            >
              Create free account
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="ml-1"
              >
                <path
                  d="M7 4l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <p className="text-dusk-500 text-xs mt-4 font-mono">
              No credit card · No usage limits · Projects sync across devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
