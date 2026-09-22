"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/landing/Navbar";
import { GitMerge, LayoutDashboard, Code2, AlertTriangle, ArrowRight, Activity, TerminalSquare, Search } from "lucide-react";

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

/* ── Retro Dithered Cloud Background ── */
function DitheredClouds() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[var(--color-surface)] pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bayer-dither" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill="var(--color-ambient)" />
            <rect x="2" y="2" width="2" height="2" fill="var(--color-ambient)" />
          </pattern>
        </defs>
        
        {/* Cloud shapes using the dither pattern */}
        <path 
          d="M -100,200 Q 150,50 400,250 T 900,150 T 1400,300 L 1400,-100 L -100,-100 Z" 
          fill="url(#bayer-dither)" 
          opacity="0.8"
        />
        <path 
          d="M -200,400 Q 200,600 600,350 T 1300,500 T 1800,200 L 1800,-100 L -200,-100 Z" 
          fill="url(#bayer-dither)" 
          opacity="0.4"
        />
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
          <DitheredClouds />
          
          <div className="relative z-10 max-w-[1024px] mx-auto w-full px-6 flex flex-col items-center text-center">
            {/* Opaque Mint Fog panel for text to ensure legibility over dither */}
            <div className="bg-surface p-8 sm:p-12 border border-border shadow-sm max-w-4xl stagger-children">
              
              <h1 className="font-headline-hero text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-[-0.02em] text-text-primary font-bold">
                Code review that can't hallucinate syntax.
              </h1>

              <p className="font-body-base text-[clamp(1.125rem,2vw,1.25rem)] text-text-secondary max-w-3xl mx-auto mt-6">
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
                  href="#ast-generation"
                  className="font-body-base text-text-secondary hover:text-text-primary underline underline-offset-4 decoration-border hover:decoration-text-primary transition-colors py-4 px-6"
                >
                  See how AST-bounded generation works
                </Link>
              </div>
            </div>
            
            {/* Infrastructure line */}
            <p className="mt-16 text-text-secondary font-label-ui uppercase tracking-widest text-xs bg-surface px-4 py-2 border border-border">
              Routed across Gemini, Groq, NVIDIA NIM, and Pollinations with automatic failover
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FOUR PRIMARY PILLARS
            ═══════════════════════════════════════════ */}
        <section className="relative bg-surface py-32 border-t border-border z-10">
          <div className="max-w-[1024px] mx-auto px-6 flex flex-col gap-40">
            
            {/* 1. Automated PR Review */}
            <FadeIn className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-structural text-surface flex items-center justify-center mb-2">
                  <GitMerge size={24} />
                </div>
                <h2 className="font-headline-section text-headline-section text-text-primary font-semibold tracking-tight">
                  Automated PR Review
                </h2>
                <p className="font-body-base text-body-base text-text-secondary leading-relaxed">
                  Webhook-triggered on PR open/synchronize. Inline GitHub review comments carry severity and category. Review categories are configurable per repository.
                </p>
              </div>
              <div className="flex-1 w-full bg-surface-dark border border-border aspect-video flex items-center justify-center relative overflow-hidden shadow-sm p-6">
                {/* Abstract visualization of a PR comment */}
                <div className="w-full bg-surface border border-border p-4">
                  <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
                    <span className="w-6 h-6 bg-border rounded-full" />
                    <div className="h-3 w-24 bg-border" />
                    <span className="ml-auto font-badge-mono text-[10px] uppercase text-destructive border border-destructive/30 px-1.5 py-0.5 bg-destructive/5">High / Security</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-border" />
                    <div className="h-2 w-5/6 bg-border" />
                    <div className="h-2 w-4/6 bg-border" />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* 2. AST-Bounded Generation (The Differentiator) */}
            <FadeIn className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24" delay={0.1}>
              <div id="ast-generation" className="flex-1 space-y-6">
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
                  We parse your code, extract the suspect node by byte range, constrain the model to a structured <code>NodeMutation</code> JSON response, splice the patch at exact byte offsets, and re-parse. Anything that doesn't validate is rejected.
                </p>
              </div>
              <div className="flex-1 w-full bg-surface-dark border border-border aspect-square md:aspect-auto md:h-[400px] flex items-center justify-center shadow-sm p-8">
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

            {/* 3. Self-Healing CI */}
            <FadeIn className="flex flex-col md:flex-row items-center gap-12 md:gap-24" delay={0.1}>
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-structural text-surface flex items-center justify-center mb-2">
                  <Activity size={24} />
                </div>
                <h2 className="font-headline-section text-headline-section text-text-primary font-semibold tracking-tight">
                  Self-Healing CI
                </h2>
                <p className="font-body-base text-body-base text-text-secondary leading-relaxed">
                  Triggered by a failing <code>check_run</code>. Boots an E2B microVM, clones the repo, confirms the failure, generates an AST-bounded patch (max 3 attempts), validates it, and auto-commits on success.
                </p>
              </div>
              <div className="flex-1 w-full bg-surface-dark border border-border aspect-video flex items-center justify-center p-6 shadow-sm">
                {/* Mock Commit Message */}
                <div className="w-full bg-surface border border-border p-5 text-left font-code-diff">
                  <div className="flex items-center gap-2 mb-2 text-text-secondary">
                    <span className="w-2 h-2 rounded-full bg-structural" />
                    <span>kareixo-bot committed 2 mins ago</span>
                  </div>
                  <p className="text-text-primary font-bold text-base">
                    [Kareixo Auto-Heal] Verified fix applied
                  </p>
                  <p className="text-text-secondary text-sm mt-3 border-l-2 border-border pl-3">
                    Resolved TypeError in src/auth.ts line 42.<br/>
                    Failed check: "jest-tests"<br/>
                    Verified clean via E2B microVM sandbox.
                  </p>
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
                  Visual QA
                </h2>
                <p className="font-body-base text-body-base text-text-secondary leading-relaxed">
                  Browser automation against the PR's preview URL via Figranium. Captures screenshots, DOM snapshots, console errors, and network failures, then performs LLM-powered regression analysis with severity, location, and fix suggestions.
                </p>
              </div>
              <div className="flex-1 w-full bg-surface-dark border border-border aspect-video flex items-center justify-center p-6 shadow-sm">
                <div className="w-full h-full border border-border bg-surface flex flex-col">
                  <div className="h-6 border-b border-border flex items-center px-2 gap-1 bg-surface-dark">
                    <div className="w-2 h-2 rounded-full border border-border" />
                    <div className="w-2 h-2 rounded-full border border-border" />
                    <div className="w-2 h-2 rounded-full border border-border" />
                  </div>
                  <div className="flex-1 relative overflow-hidden">
                    {/* Fake browser UI content */}
                    <div className="absolute inset-4 border-2 border-dashed border-destructive/50 bg-destructive/5 flex items-center justify-center">
                      <div className="bg-surface border border-destructive p-2 shadow-md flex items-center gap-2 font-badge-mono text-xs text-destructive">
                        <AlertTriangle size={14} /> DOM Misalignment Detected
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECONDARY TOOLS ROW
            ═══════════════════════════════════════════ */}
        <section className="bg-surface-dark py-24 border-t border-border z-10 relative">
          <div className="max-w-[1280px] mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <h3 className="font-title-card text-title-card text-text-primary font-semibold">
                Developer Tools
              </h3>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Heatmap */}
              <FadeIn delay={0.1}>
                <div className="bg-surface border border-border p-6 h-full flex flex-col">
                  <div className="w-10 h-10 border border-border flex items-center justify-center mb-4 text-text-secondary">
                    <Activity size={20} />
                  </div>
                  <h4 className="font-title-card-sm text-title-card-sm text-text-primary font-semibold mb-2">
                    Probabilistic Bug Heatmap
                  </h4>
                  <p className="font-body-sm text-body-sm text-text-secondary">
                    Line-level defect scoring across your entire repository. Click to explain high-risk lines.
                  </p>
                </div>
              </FadeIn>

              {/* Live Review */}
              <FadeIn delay={0.2}>
                <div className="bg-surface border border-border p-6 h-full flex flex-col">
                  <div className="w-10 h-10 border border-border flex items-center justify-center mb-4 text-text-secondary">
                    <LayoutDashboard size={20} />
                  </div>
                  <h4 className="font-title-card-sm text-title-card-sm text-text-primary font-semibold mb-2">
                    Live Review Dashboard
                  </h4>
                  <p className="font-body-sm text-body-sm text-text-secondary">
                    Real-time visualization of the automated review pipeline as Kareixo analyzes each pull request.
                  </p>
                </div>
              </FadeIn>

              {/* CodeChat */}
              <FadeIn delay={0.3}>
                <div className="bg-surface border border-border p-6 h-full flex flex-col">
                  <div className="w-10 h-10 border border-border flex items-center justify-center mb-4 text-text-secondary">
                    <TerminalSquare size={20} />
                  </div>
                  <h4 className="font-title-card-sm text-title-card-sm text-text-primary font-semibold mb-2">
                    CodeChat
                  </h4>
                  <p className="font-body-sm text-body-sm text-text-secondary">
                    Repo-aware assistant augmented with tools to search, read, and explain your specific architecture.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

      </main>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-border bg-surface relative z-10">
        <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-semibold text-text-primary text-lg">
            <Image src="/logo.png" alt="Kareixo" width={24} height={24} />
            Kareixo
          </div>
          
          <div className="flex items-center gap-6 font-body-sm text-text-secondary">
            <Link href="/pricing" className="hover:text-text-primary">Pricing</Link>
            <Link href="/dashboard" className="hover:text-text-primary">Dashboard</Link>
            <a href="https://github.com/karanray06/Kareixo" target="_blank" rel="noreferrer" className="hover:text-text-primary">GitHub</a>
          </div>
          
          <span className="font-badge-mono text-badge-mono text-text-secondary">
            © {new Date().getFullYear()} Kareixo.
          </span>
        </div>
      </footer>
    </div>
  );
}
