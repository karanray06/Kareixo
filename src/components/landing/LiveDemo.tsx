"use client";

import { useState, useEffect, useRef } from "react";
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
        setTimeout(() => setHasStarted(true), 500);
      }, 12000)
    );

    return () => timers.forEach(clearTimeout);
  }, [hasStarted]);

  // Start on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
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
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          See the <span className="text-gradient-cyan">Glass Box</span> in action
        </h2>
        <p className="text-dusk-700 text-lg max-w-xl mx-auto">
          Every agent action follows the same 4-step flow: Think → Diff → Security Check → Apply.
          Nothing happens without your approval.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="glass-strong rounded-xl overflow-hidden" style={{ borderRadius: "var(--radius-lg)" }}>
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-cream-300">
            <div className="w-3 h-3 rounded-full bg-red-400 opacity-60" />
            <div className="w-3 h-3 rounded-full bg-rosegold-400 opacity-60" />
            <div className="w-3 h-3 rounded-full bg-green-400 opacity-60" />
            <span className="ml-3 text-dusk-500 text-sm font-mono">
              Kareixo Agent Panel
            </span>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4 min-h-[420px] font-mono text-sm">
            {/* User prompt */}
            {activeStep >= 0 && (
              <div className="animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-cream-300 flex items-center justify-center text-xs text-dusk-700 shrink-0 mt-0.5">
                    U
                  </div>
                  <div className="bg-cream-200 rounded-lg px-4 py-3 text-dusk-900">
                    <TypingText text={(DEMO_STEPS[0] as any).text} speed={30} />
                  </div>
                </div>
              </div>
            )}

            {/* Thinking step */}
            {activeStep >= 1 && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 text-coral-400 text-xs mb-2 ml-9">
                  <Lamp size={14} variant="Outline" />
                  STEP 1 — Thinking
                </div>
                <div className="ml-9 glass-cyan rounded-lg px-4 py-3 text-coral-200 text-xs leading-relaxed">
                  <TypingText text={(DEMO_STEPS[1] as any).text} speed={15} />
                </div>
              </div>
            )}

            {/* Diff step */}
            {activeStep >= 2 && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 text-coral-400 text-xs mb-2 ml-9">
                  <Code1 size={14} variant="Outline" />
                  STEP 2 — Proposed Change
                  <span className="text-dusk-500 ml-2">
                    {(DEMO_STEPS[2] as typeof DEMO_STEPS[2] & { filename: string }).filename}
                  </span>
                </div>
                <div className="ml-9 bg-cream-100 rounded-lg overflow-hidden border border-cream-300">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-cream-200 border-b border-cream-300 text-xs">
                    <span className="text-dusk-500">
                      {(DEMO_STEPS[2] as typeof DEMO_STEPS[2] & { filename: string }).filename}
                    </span>
                    <span>
                      <span className="text-green-400">+{(DEMO_STEPS[2] as typeof DEMO_STEPS[2] & { additions: number }).additions}</span>
                      {" "}
                      <span className="text-red-400">-{(DEMO_STEPS[2] as typeof DEMO_STEPS[2] & { deletions: number }).deletions}</span>
                    </span>
                  </div>
                  <pre className="p-3 text-xs leading-relaxed overflow-x-auto">
                    {(DEMO_STEPS[2] as typeof DEMO_STEPS[2] & { code: string }).code.split("\n").map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.startsWith("+")
                            ? "text-green-400 bg-green-400/5"
                            : "text-dusk-500"
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
                <div className="flex items-center gap-2 text-rosegold-400 text-xs mb-2 ml-9">
                  <ShieldTick size={14} variant="Outline" />
                  STEP 3 — Security Pass
                </div>
                <div className="ml-9 space-y-1.5">
                  {(DEMO_STEPS[3] as typeof DEMO_STEPS[3] & { checks: { name: string; passed: boolean }[] }).checks.map((check, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${i * 0.15}s forwards`,
                        opacity: 0,
                      }}
                    >
                      <span className="text-green-400">✓</span>
                      <span className="text-dusk-700">{check.name}</span>
                    </div>
                  ))}
                  <div
                    className="mt-3 badge badge-amber glow-amber"
                    style={{
                      animation: "fadeInUp 0.3s ease-out 0.6s forwards",
                      opacity: 0,
                    }}
                  >
                    <ShieldTick size={12} variant="Bold" />
                    SECURITY CHECK PASSED
                  </div>
                </div>
              </div>
            )}

            {/* Provider badge */}
            {activeStep >= 4 && (
              <div className="animate-fade-in-up ml-9 flex items-center gap-3">
                <span className="badge badge-cyan text-[11px]">
                  via {(DEMO_STEPS[4] as typeof DEMO_STEPS[4] & { model: string; provider: string; latency: string }).model} · {(DEMO_STEPS[4] as typeof DEMO_STEPS[4] & { model: string; provider: string; latency: string }).provider}
                </span>
                <span className="text-dusk-500 text-[11px]">
                  {(DEMO_STEPS[4] as typeof DEMO_STEPS[4] & { model: string; provider: string; latency: string }).latency}
                </span>
                <button className="btn btn-primary text-xs px-4 py-1.5 ml-auto">
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
