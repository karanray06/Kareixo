"use client";

import Link from "next/link";
import { CloudBackground } from "@/components/landing/CloudBackground";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/landing/Navbar";
import { GitMerge, LayoutDashboard, Code2, AlertTriangle, ArrowRight, Activity, TerminalSquare, Search, Flame, Server, Network, Star } from "lucide-react";

/* ── Animation helpers ── */
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Clean Hero Background ── */
function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-canvas-dark pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#E8FFF2" opacity="0.03" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-text-primary font-body-base overflow-x-hidden">
      <Navbar />

      <main className="relative">
        {/* ═══════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════ */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16">
          <HeroBackground />
          <CloudBackground />
          
          <div className="relative z-10 max-w-[1024px] mx-auto w-full px-6 flex flex-col items-center text-center">
            {/* Text floating directly over the cloud background */}
            <div className="p-8 sm:p-12 max-w-4xl stagger-children flex flex-col items-center">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm text-structural border border-structural/20 text-sm font-medium mb-6 shadow-sm">
                <Star size={14} className="fill-structural" />
                <span>Now analyzing 10,000+ PRs weekly</span>
              </div>

              <h1 className="font-headline-hero text-5xl sm:text-6xl lg:text-[72px] leading-[1.05] tracking-[-0.02em] text-text-primary-dark font-bold">
                Code review that can&apos;t hallucinate syntax.
              </h1>

              <p className="font-body-base text-[clamp(1.125rem,2vw,1.25rem)] text-text-secondary-dark max-w-3xl mx-auto mt-6">
                Kareixo reviews every pull request, patches bugs it's certain about, and heals failing tests — every patch is generated inside your code's actual syntax tree and re-validated before it ships.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <a
                  href="https://github.com/apps/kareixo-reviewer/installations/new"
                  className="btn btn-primary text-lg px-8 py-4"
                >
                  Connect a repository
                </a>
                <Link
                  href="#features"
                  className="font-body-base text-text-secondary-dark hover:text-text-primary-dark underline underline-offset-4 decoration-border hover:decoration-text-primary transition-colors py-4 px-6"
                >
                  See how it works
                </Link>
              </div>
            </div>
            
            {/* Infrastructure line */}
            <p className="mt-16 text-text-secondary font-label-ui uppercase tracking-widest text-xs bg-surface px-4 py-2 border border-border shadow-sm">
              Routed across Gemini, Groq, NVIDIA NIM, and Pollinations with automatic failover
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FEATURES
            ═══════════════════════════════════════════ */}
        <section id="features" className="relative bg-surface py-32 border-t border-border z-10">
          <div className="max-w-[1024px] mx-auto px-6 flex flex-col gap-40">
            
            {/* 1. AST-Bounded Generation (The Differentiator) */}
            <FadeIn className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-structural text-surface flex items-center justify-center mb-2">
                  <Code2 size={24} />
                </div>
                <h2 className="font-headline-section text-headline-section text-text-primary font-semibold tracking-tight">
                  AST-Bounded Generation
                </h2>
                <p className="font-title-card-sm text-title-card-sm text-text-primary">
                  Most AI code tools can hallucinate a syntax error into your codebase. Kareixo's patches are rejected if they don't re-parse clean.
                </p>
                <p className="font-body-base text-body-base text-text-secondary leading-relaxed">
                  We parse your code using tree-sitter, extract the suspect node by byte range, constrain the model to a structured <code>NodeMutation</code> JSON response, splice the patch at exact byte offsets, and re-parse. Anything that doesn't validate is rejected.
                </p>
              </div>
              <div className="flex-1 w-full bg-canvas-inset border border-border aspect-square md:aspect-auto md:h-[400px] flex items-center justify-center p-8">
                {/* Step diagram */}
                <div className="flex flex-col gap-4 w-full max-w-sm">
                  <div className="flex items-center gap-4 bg-surface border border-border p-3 font-code-diff text-sm">
                    <span className="text-structural font-bold">1</span>
                    Parse AST
                  </div>
                  <div className="w-px h-6 bg-border ml-7" />
                  <div className="flex items-center gap-4 bg-surface border border-border p-3 font-code-diff text-sm">
                    <span className="text-structural font-bold">2</span>
                    Extract Node by Byte Range
                  </div>
                  <div className="w-px h-6 bg-border ml-7" />
                  <div className="flex items-center gap-4 bg-structural text-surface border border-structural p-3 font-code-diff text-sm font-semibold shadow-md">
                    <span className="opacity-80">3</span>
                    Splice NodeMutation JSON
                  </div>
                  <div className="w-px h-6 bg-border ml-7" />
                  <div className="flex items-center gap-4 bg-surface border border-border p-3 font-code-diff text-sm">
                    <span className="text-structural font-bold">4</span>
                    Re-parse &amp; Validate
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* 2. Self-Healing CI */}
            <FadeIn className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24" delay={0.1}>
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-structural text-surface flex items-center justify-center mb-2">
                  <Activity size={24} />
                </div>
                <h2 className="font-headline-section text-headline-section text-text-primary font-semibold tracking-tight">
                  Self-Healing CI
                </h2>
                <p className="font-body-base text-body-base text-text-secondary leading-relaxed">
                  Triggered by a failing <code>check_run</code>. Boots an E2B microVM sandbox, clones the repo, confirms the failure, generates an AST-bounded patch (max 3 attempts), validates it, and auto-commits on success.
                </p>
              </div>
              <div className="flex-1 w-full bg-canvas-inset border border-border aspect-video flex items-center justify-center p-6">
                {/* Mock Terminal Window */}
                <div className="terminal-window w-full shadow-lg">
                  <div className="terminal-titlebar">
                    <div className="flex gap-1.5">
                      <div className="terminal-dot bg-destructive" />
                      <div className="terminal-dot bg-accent-amber" />
                      <div className="terminal-dot bg-structural" />
                    </div>
                    <span className="ml-2 font-code-diff text-[11px] text-border">e2b-sandbox-executor</span>
                  </div>
                  <div className="p-4 font-code-diff text-xs leading-relaxed bg-text-primary text-surface h-48 overflow-hidden">
                    <div className="text-destructive">✖ fail  jest-tests</div>
                    <div className="text-border mt-2">&gt; kareixo heal --run-id=78291</div>
                    <div className="text-accent-amber mt-1">Booting E2B microVM sandbox...</div>
                    <div className="text-surface mt-1">Reproducing failure in src/auth.ts:42</div>
                    <div className="text-surface mt-1">Generating AST-bounded patch (attempt 1/3)...</div>
                    <div className="text-structural mt-1">Patch applied and re-parsed cleanly.</div>
                    <div className="text-structural mt-1">Running tests... PASS</div>
                    <div className="text-structural mt-2 font-bold">[Kareixo Auto-Heal] Verified fix committed.</div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* 3. Probabilistic Bug Heatmap */}
            <FadeIn className="flex flex-col md:flex-row items-center gap-12 md:gap-24" delay={0.1}>
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-structural text-surface flex items-center justify-center mb-2">
                  <Flame size={24} />
                </div>
                <h2 className="font-headline-section text-headline-section text-text-primary font-semibold tracking-tight">
                  Probabilistic Bug Heatmap
                </h2>
                <p className="font-body-base text-body-base text-text-secondary leading-relaxed">
                  Line-level defect scoring across your entire repository. Lines are scored by severity (0.0–1.0) and categorized by logic, security, performance, or race conditions.
                </p>
              </div>
              <div className="flex-1 w-full bg-canvas-inset border border-border aspect-video flex items-center justify-center p-6">
                {/* Mock Heatmap UI */}
                <div className="w-full bg-surface border border-border font-code-diff text-xs flex flex-col">
                  <div className="flex hover:bg-canvas-subtle p-2 group relative">
                    <span className="w-8 text-fg-subtle text-right pr-3 select-none">41</span>
                    <span className="text-text-primary">  const user = await db.query(id);</span>
                  </div>
                  <div className="flex bg-destructive/10 p-2 relative group cursor-pointer border-l-2 border-destructive">
                    <span className="w-8 text-destructive text-right pr-3 select-none font-bold">42</span>
                    <span className="text-text-primary font-medium">  if (user.role === "admin") {'{'}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute left-10 top-full mt-1 bg-surface border border-destructive shadow-lg p-3 z-10 w-64 pointer-events-none">
                      <div className="flex justify-between items-center border-b border-border pb-1 mb-2">
                        <span className="font-bold text-destructive">High Risk (0.89)</span>
                        <span className="text-[10px] uppercase border border-border px-1">Null Ref</span>
                      </div>
                      <p className="text-text-secondary whitespace-normal leading-tight">Possible TypeError: user may be null if id is not found in db.query().</p>
                    </div>
                  </div>
                  <div className="flex hover:bg-canvas-subtle p-2 group relative">
                    <span className="w-8 text-fg-subtle text-right pr-3 select-none">43</span>
                    <span className="text-text-primary">    grantAccess();</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* 4. Visual QA */}
            <FadeIn className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24" delay={0.1}>
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-structural text-surface flex items-center justify-center mb-2">
                  <Search size={24} />
                </div>
                <h2 className="font-headline-section text-headline-section text-text-primary font-semibold tracking-tight">
                  Visual QA via Figranium
                </h2>
                <p className="font-body-base text-body-base text-text-secondary leading-relaxed">
                  Browser automation against PR preview URLs. Captures screenshots, DOM snapshots, console errors, and network failures, then performs LLM-powered visual regression analysis.
                </p>
              </div>
              <div className="flex-1 w-full bg-canvas-inset border border-border aspect-video flex items-center justify-center p-6">
                {/* Mock Browser UI */}
                <div className="w-full h-full border border-border bg-surface flex flex-col shadow-md">
                  <div className="h-8 border-b border-border flex items-center px-3 gap-1.5 bg-canvas-subtle">
                    <div className="w-2.5 h-2.5 rounded-full border border-border bg-border" />
                    <div className="w-2.5 h-2.5 rounded-full border border-border bg-border" />
                    <div className="w-2.5 h-2.5 rounded-full border border-border bg-border" />
                    <div className="ml-4 flex-1 bg-surface border border-border h-5 rounded flex items-center px-2 text-[10px] text-text-secondary">
                      https://pr-42-preview.vercel.app
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
                    {/* Fake page content */}
                    <div className="w-3/4 h-3/4 border border-border/50 bg-canvas-subtle flex flex-col relative">
                      <div className="h-6 border-b border-border/50" />
                      <div className="p-4 flex gap-4">
                        <div className="w-1/3 h-20 bg-border/30" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-border/30 w-full" />
                          <div className="h-4 bg-border/30 w-5/6" />
                        </div>
                      </div>
                      
                      {/* Bounding box for visual QA failure */}
                      <div className="absolute top-1/2 left-4 right-4 h-16 border-2 border-dashed border-destructive bg-destructive/5 flex items-center justify-center">
                        <div className="bg-surface border border-destructive p-2 shadow-sm flex items-center gap-2 font-badge-mono text-[10px] text-destructive absolute -top-8 right-0">
                          <AlertTriangle size={12} /> Layout overflow detected
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* 5. CodeChat */}
            <FadeIn className="flex flex-col md:flex-row items-center gap-12 md:gap-24" delay={0.1}>
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-structural text-surface flex items-center justify-center mb-2">
                  <TerminalSquare size={24} />
                </div>
                <h2 className="font-headline-section text-headline-section text-text-primary font-semibold tracking-tight">
                  CodeChat (Repo-Aware)
                </h2>
                <p className="font-body-base text-body-base text-text-secondary leading-relaxed">
                  Real-time streaming chat augmented with tools to search, read, and explore your specific architecture. Instead of pasting files, just ask questions.
                </p>
              </div>
              <div className="flex-1 w-full bg-canvas-inset border border-border aspect-video flex items-center justify-center p-6">
                {/* Mock CodeChat Window */}
                <div className="w-full bg-surface border border-border shadow-md rounded-lg overflow-hidden flex flex-col h-full max-h-[300px]">
                  <div className="h-10 border-b border-border flex items-center px-4 bg-canvas-subtle justify-between">
                    <span className="font-title-card-sm text-sm text-text-primary">Session: karenray06/Kareixo</span>
                    <span className="font-badge-mono text-[10px] text-structural border border-structural/30 px-1.5 py-0.5 rounded bg-structural/10">TOOLS ACTIVE</span>
                  </div>
                  <div className="flex-1 p-4 overflow-hidden flex flex-col gap-3 font-body-sm text-sm">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded bg-canvas-inset flex-shrink-0" />
                      <div className="bg-canvas-inset p-2 rounded text-text-primary w-fit">Where is the routing logic?</div>
                    </div>
                    <div className="flex gap-2 flex-row-reverse">
                      <div className="w-6 h-6 rounded bg-structural flex-shrink-0" />
                      <div className="flex flex-col gap-2 items-end w-full">
                        <div className="flex items-center gap-2 font-code-diff text-[10px] text-text-secondary bg-canvas-subtle px-2 py-1 rounded border border-border">
                          <Search size={12} /> Searching: "model router" ✓
                        </div>
                        <div className="bg-surface border border-border p-2 rounded text-text-secondary text-left w-[85%]">
                          The multi-model routing logic is located in <code className="text-structural bg-canvas-inset px-1">src/lib/model-router.ts</code>. It implements the failover chain across Gemini, Groq, and Pollinations.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* 6. Multi-Model Router */}
            <FadeIn className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24" delay={0.1}>
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-structural text-surface flex items-center justify-center mb-2">
                  <Network size={24} />
                </div>
                <h2 className="font-headline-section text-headline-section text-text-primary font-semibold tracking-tight">
                  Multi-Model Router
                </h2>
                <p className="font-body-base text-body-base text-text-secondary leading-relaxed">
                  Automatic failover and rate-limit management. Kareixo dynamically routes requests across Gemini, Groq, NVIDIA NIM (GLM-5.3), and Pollinations based on the task type (chat vs. code generation) and provider health.
                </p>
              </div>
              <div className="flex-1 w-full bg-canvas-inset border border-border aspect-video flex items-center justify-center p-6">
                {/* Mock Router Diagram */}
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 relative">
                  <div className="bg-surface border-2 border-text-primary px-4 py-2 font-bold z-10 text-text-primary">
                    Incoming Request
                  </div>
                  <div className="w-0.5 h-6 bg-border" />
                  <div className="bg-canvas-subtle border border-border px-4 py-2 font-code-diff text-sm z-10 text-text-secondary">
                    ModelRouter.executeWithFailover()
                  </div>
                  <div className="w-0.5 h-6 bg-border" />
                  <div className="flex gap-4 z-10 w-full justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-surface border border-destructive text-destructive px-3 py-1 text-xs opacity-50 relative line-through">
                        NVIDIA NIM
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] border border-destructive px-1">429</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-structural text-surface px-3 py-1 text-xs font-bold shadow-md">
                        Groq
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-structural border border-structural px-1">200 OK</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-surface border border-border text-text-secondary px-3 py-1 text-xs opacity-50">
                        Gemini
                      </div>
                    </div>
                  </div>
                  
                  {/* Connective lines */}
                  <div className="absolute top-[138px] left-1/2 -translate-x-1/2 w-48 h-0.5 bg-border z-0" />
                </div>
              </div>
            </FadeIn>

          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-border bg-surface relative z-10">
        <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-semibold text-text-primary text-lg">
            <Image src="/logo.svg" alt="Kareixo" width={24} height={24} />
            Kareixo
          </div>
          
          <div className="flex items-center gap-6 font-body-sm text-text-secondary">
            <Link href="/pricing" className="hover:text-text-primary">Pricing</Link>
            <Link href="/dashboard" className="hover:text-text-primary">Dashboard</Link>
            <a href="https://github.com/karanray06/Kareixo" target="_blank" rel="noreferrer" className="hover:text-text-primary">GitHub</a>
          </div>
          
          <div className="flex flex-col gap-1 font-badge-mono text-badge-mono text-text-secondary text-right">
            <span>© {new Date().getFullYear()} Kareixo.</span>
            <a href="https://github.com/elixpo" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary text-[10px] flex items-center justify-end gap-1.5 transition-colors">
              <span className="w-1 h-1 rounded-full bg-structural" />
              An Elixpo ecosystem project
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
