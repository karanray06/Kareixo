"use client";

import { useState, useEffect, useRef } from "react";
import anime from "animejs";
import { Lamp, Code1, ShieldTick } from "iconsax-react";

/* ── Scripted demo sequence ── */
const DEMO_STEPS = [
  {
    type: "user" as const,
    text: "Add a rate limiter middleware to the Express API",
    delay: 0,
  },
  {
    type: "thinking" as const,
    text: "Analyzing the project structure… I see an Express app with routes in /src/routes. I'll create a rate-limiting middleware using a sliding window counter pattern — no external dependencies needed. This avoids vendor lock-in compared to using express-rate-limit.",
    delay: 1800,
  },
  {
    type: "diff" as const,
    filename: "src/middleware/rateLimiter.ts",
    additions: 24,
    deletions: 0,
    code: `+ import { Request, Response, NextFunction } from 'express';
+
+ const windowMs = 15 * 60 * 1000; // 15 min
+ const maxRequests = 100;
+ const clients = new Map<string, number[]>();
+
+ export function rateLimiter(
+   req: Request, res: Response, next: NextFunction
+ ) {
+   const ip = req.ip ?? 'unknown';
+   const now = Date.now();
+   const timestamps = (clients.get(ip) ?? [])
+     .filter(t => now - t < windowMs);
+
+   if (timestamps.length >= maxRequests) {
+     return res.status(429).json({
+       error: 'Too many requests'
+     });
+   }
+
+   timestamps.push(now);
+   clients.set(ip, timestamps);
+   next();
+ }`,
    delay: 4000,
  },
  {
    type: "security" as const,
    passed: true,
    checks: [
      { name: "No hardcoded secrets", passed: true },
      { name: "No eval/exec usage", passed: true },
      { name: "Input validation present", passed: true },
      { name: "No XSS vectors", passed: true },
    ],
    delay: 7000,
  },
  {
    type: "provider" as const,
    model: "DeepSeek V4 Flash",
    provider: "OpenRouter",
    latency: "1.2s",
    delay: 8500,
  },
];

function TypingText({ text, speed = 25 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-coral-400 ml-[1px] align-text-bottom animate-[blink_1s_step-end_infinite]" />
      )}
    </span>
  );
}

export default function LiveDemo() {
  const [activeStep, setActiveStep] = useState(-1);
  const [cycle, setCycle] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Restart cycle
  useEffect(() => {
    if (!hasStarted) return;

    const timers: NodeJS.Timeout[] = [];
    DEMO_STEPS.forEach((step, i) => {
      timers.push(setTimeout(() => setActiveStep(i), step.delay));
    });

    // Restart after full cycle
    timers.push(
      setTimeout(() => {
        setActiveStep(-1);
        setTimeout(() => setCycle(c => c + 1), 500);
      }, 12000)
    );

    return () => timers.forEach(clearTimeout);
  }, [hasStarted, cycle]);

  // Start on scroll into view and animate entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasStarted) {
            setHasStarted(true);
          }
          anime({
            targets: '.demo-reveal',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: anime.stagger(150),
            duration: 800,
            easing: 'easeOutCubic'
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  return (
    <div
      ref={containerRef}
      id="demo"
      className="section"
    >
      <div className="text-center mb-12 demo-reveal opacity-0 hidden">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          See the <span className="text-cyan-400">Glass Box</span> in action
        </h2>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Every agent action follows the same 4-step flow: Think → Diff → Security Check → Apply.
          Nothing happens without your approval.
        </p>
      </div>

      <div className="max-w-3xl mx-auto demo-reveal opacity-0">
        <div className="bg-black/60 backdrop-blur-3xl rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-80 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="ml-3 text-white/50 text-xs font-mono tracking-wider uppercase">
              Kareixo Agent Panel
            </span>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4 min-h-[420px] font-mono text-sm">
            {/* User prompt */}
            {activeStep >= 0 && (
              <div className="animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs text-white font-bold shrink-0 mt-0.5 shadow-lg shadow-cyan-500/20">
                    U
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 shadow-inner">
                    <TypingText text={(DEMO_STEPS[0] as any).text} speed={30} />
                  </div>
                </div>
              </div>
            )}

            {/* Thinking step */}
            {activeStep >= 1 && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 text-pink-400 text-xs mb-2 ml-10 font-semibold tracking-wide uppercase">
                  <Lamp size={14} variant="Bold" />
                  STEP 1 — Thinking
                </div>
                <div className="ml-10 bg-gradient-to-r from-pink-500/10 to-transparent border-l-2 border-pink-500 rounded-r-lg px-4 py-3 text-pink-200/80 text-xs leading-relaxed">
                  <TypingText text={(DEMO_STEPS[1] as any).text} speed={15} />
                </div>
              </div>
            )}

            {/* Diff step */}
            {activeStep >= 2 && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 text-cyan-400 text-xs mb-2 ml-10 font-semibold tracking-wide uppercase">
                  <Code1 size={14} variant="Bold" />
                  STEP 2 — Proposed Change
                  <span className="text-white/40 ml-2 normal-case font-normal">
                    {(DEMO_STEPS[2] as typeof DEMO_STEPS[2] & { filename: string }).filename}
                  </span>
                </div>
                <div className="ml-10 bg-black/40 rounded-lg overflow-hidden border border-white/10">
                  <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs">
                    <span className="text-white/60">
                      {(DEMO_STEPS[2] as typeof DEMO_STEPS[2] & { filename: string }).filename}
                    </span>
                    <span>
                      <span className="text-green-400">+{(DEMO_STEPS[2] as typeof DEMO_STEPS[2] & { additions: number }).additions}</span>
                      {" "}
                      <span className="text-red-400">-{(DEMO_STEPS[2] as typeof DEMO_STEPS[2] & { deletions: number }).deletions}</span>
                    </span>
                  </div>
                  <pre className="p-4 text-[11px] md:text-xs leading-relaxed overflow-x-auto font-mono">
                    {(DEMO_STEPS[2] as typeof DEMO_STEPS[2] & { code: string }).code.split("\n").map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.startsWith("+")
                            ? "text-green-300 bg-green-500/10 -mx-4 px-4 border-l-2 border-green-500"
                            : "text-white/50"
                        }
                      >
                        {line}
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            )}

            {/* Security check */}
            {activeStep >= 3 && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 text-green-400 text-xs mb-2 ml-10 font-semibold tracking-wide uppercase">
                  <ShieldTick size={14} variant="Bold" />
                  STEP 3 — Security Pass
                </div>
                <div className="ml-10 space-y-2">
                  {(DEMO_STEPS[3] as typeof DEMO_STEPS[3] & { checks: { name: string; passed: boolean }[] }).checks.map((check, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-xs bg-white/5 rounded px-3 py-1.5 border border-white/5"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${i * 0.15}s forwards`,
                        opacity: 0,
                      }}
                    >
                      <span className="text-green-400 font-bold">✓</span>
                      <span className="text-white/80">{check.name}</span>
                    </div>
                  ))}
                  <div
                    className="mt-4 flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                    style={{
                      animation: "fadeInUp 0.3s ease-out 0.6s forwards",
                      opacity: 0,
                    }}
                  >
                    <ShieldTick size={16} variant="Bold" />
                    SECURITY CHECK PASSED
                  </div>
                </div>
              </div>
            )}

            {/* Provider badge */}
            {activeStep >= 4 && (
              <div className="animate-fade-in-up ml-10 flex items-center gap-3 pt-4 border-t border-white/10 mt-4">
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase">
                  via {(DEMO_STEPS[4] as typeof DEMO_STEPS[4] & { model: string; provider: string; latency: string }).model}
                </span>
                <span className="text-white/40 text-[11px]">
                  {(DEMO_STEPS[4] as typeof DEMO_STEPS[4] & { model: string; provider: string; latency: string }).latency}
                </span>
                <button className="ml-auto bg-[#ff5005] hover:bg-[#e64604] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(255,80,5,0.3)] hover:scale-105 transform duration-200">
                  Apply Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
