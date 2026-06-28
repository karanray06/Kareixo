"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
// @ts-expect-error animejs types do not have a default export
import anime from "animejs";
import { Book, Airplane, Hierarchy, Activity } from "iconsax-react";
import { ParticleNebula, FloatingOctahedron, FloatingTorus } from "./SceneElements";

const AUDIENCES = [
  {
    icon: <Book size={24} variant="Outline" />,
    title: "Students",
    description:
      "Learn to code with an AI assistant that explains its reasoning — not just generates code. Zero cost means zero barriers.",
  },
  {
    icon: <Airplane size={24} variant="Outline" />,
    title: "Indie hackers",
    description:
      "Ship your side project with AI assistance before you've earned your first dollar. No subscription to cancel if the project doesn't work out.",
  },
  {
    icon: <Hierarchy size={24} variant="Outline" />,
    title: "Open-source contributors",
    description:
      "Review AI suggestions with the same rigor you'd review a pull request. Full diff visibility and security checks, not blind trust.",
  },
  {
    icon: <Activity size={24} variant="Outline" />,
    title: "Curious builders",
    description:
      "Prototype faster, understand deeper. The 'explain mode' helps you learn why code works, not just that it works.",
  },
];

export default function AudienceSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headlineRef.current) return;

    // Split text into words for animation
    const text = headlineRef.current.innerHTML;
    headlineRef.current.innerHTML = text.replace(/\S+/g, "<span class='word inline-block opacity-0 translate-y-4'>$&</span>");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.word',
              opacity: [0, 1],
              translateY: [15, 0],
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

    observer.observe(headlineRef.current);

    return () => observer.disconnect();
  }, []);

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
            <ParticleNebula count={300} radius={5} color="#e88a6d" size={0.015} />
            <FloatingOctahedron position={[-3, 1, -2]} scale={0.5} color="#e88a6d" speed={0.1} />
            <FloatingTorus position={[3, -1, -1]} scale={0.3} color="#c4583a" speed={0.08} />
          </Suspense>
        </Canvas>
      </div>

      <div className="section relative z-10">
        <div className="text-center mb-12">
          <h2 ref={headlineRef} className="font-display text-3xl md:text-5xl font-bold mb-4">
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
