"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/landing/Navbar";
import { GitMerge, MessageSquare, Activity, ShieldCheck, Download, Upload, CheckCircle, Plus, LayoutDashboard, Code2, AlertTriangle, Clock, Rocket, ArrowRight } from "lucide-react";

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

/* ── Feature data ── */
const FEATURES = [
  {
    icon: GitMerge,
    title: "Deterministic Static Analysis",
    description:
      "Every PR is analyzed by our AST engine. We find the bugs that regular linters miss — tracing logic paths across multiple files and enforcing architectural boundaries.",
  },
  {
    icon: MessageSquare,
    title: "CodeChat Intelligence",
    description:
      "Ask questions about your codebase directly. Kareixo reads your repo files in real-time to answer architecture and implementation questions with full context.",
  },
  {
    icon: Activity,
    title: "Incident Tracer",
    description:
      "Paste a production stack trace and watch the AST Blame Engine trace each frame back to the exact commit and PR that introduced the bug.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Configuration",
    description:
      "No complex yaml files. Install the GitHub app, select your repositories, and Kareixo starts reviewing your code immediately.",
  },
];

/* ── Steps data ── */
const STEPS = [
  {
    icon: Download,
    title: "Install the App",
    description: "One-click GitHub App installation. Select the repos you want reviewed.",
  },
  {
    icon: Upload,
    title: "Push Your Code",
    description: "Open a pull request as you normally would. Kareixo activates automatically.",
  },
  {
    icon: CheckCircle,
    title: "Get Reviewed",
    description: "Receive inline comments with actionable findings, verified by ground truth analysis.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas-default text-fg-default font-body-base overflow-x-hidden">
      <Navbar />

      <main className="relative">
        {/* ═══════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════ */}
        <section className="relative min-h-[100vh] flex items-center justify-center px-6">
          <div className="relative z-10 max-w-[1280px] mx-auto w-full flex flex-col items-center text-center stagger-children">
            {/* Main heading */}
            <h1 className="font-headline-hero text-[clamp(2rem,6vw,4rem)] leading-[1.05] tracking-[-0.02em] text-fg-default max-w-4xl font-bold">
              Code Review That Actually Understands Your Code
            </h1>

            {/* Subtitle */}
            <p className="font-body-base text-[clamp(1rem,2vw,1.125rem)] text-fg-muted max-w-2xl mt-6">
              Kareixo analyzes pull requests with deterministic static analysis, catching logic flaws and security vulnerabilities before they reach production.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
              <a
                href="https://github.com/apps/kareixo-reviewer/installations/new"
                className="btn btn-primary inline-flex items-center justify-center gap-2.5"
              >
                <Plus size={18} />
                Install on GitHub
              </a>
              <Link
                href="/dashboard"
                className="btn btn-ghost inline-flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={18} />
                View Dashboard
              </Link>
            </div>

            {/* Trust line */}
            <p className="mt-8 text-fg-subtle font-body-sm flex items-center justify-center gap-2">
              Open source. <a href="https://github.com/karanray06/Kareixo" className="underline hover:text-fg-default" target="_blank" rel="noreferrer">Read the code.</a>
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CODE REVIEW DEMO
            ═══════════════════════════════════════════ */}
        <section id="product" className="relative px-6 py-24 max-w-[1280px] mx-auto">
          <FadeIn className="w-full">
            <div className="terminal-window max-w-4xl mx-auto">
              {/* Title bar */}
              <div className="terminal-titlebar">
                <div className="flex gap-2">
                  <span className="terminal-dot bg-[#ff5f57]" />
                  <span className="terminal-dot bg-[#febc2e]" />
                  <span className="terminal-dot bg-[#28c840]" />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Code2 size={14} className="text-fg-subtle" />
                  <span className="font-code-diff text-code-diff text-fg-muted">src/auth.ts</span>
                </div>
                <div className="ml-auto">
                  <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-surface-container text-error border border-border-default">
                    1 vulnerability found
                  </span>
                </div>
              </div>

              {/* Code diff */}
              <div className="flex flex-col font-code-diff text-code-diff">
                {/* Context lines */}
                <div className="flex items-center px-4 py-0.5 text-fg-subtle">
                  <span className="w-12 text-right pr-4 select-none opacity-40 font-code-gutter">39</span>
                  <span className="w-6 text-center select-none opacity-30">&nbsp;</span>
                  <span>{"  // Compare token hashes"}</span>
                </div>
                <div className="flex items-center px-4 py-0.5 text-fg-subtle">
                  <span className="w-12 text-right pr-4 select-none opacity-40 font-code-gutter">40</span>
                  <span className="w-6 text-center select-none opacity-30">&nbsp;</span>
                  <span>{"  const a = computeHash(userToken);"}</span>
                </div>
                <div className="flex items-center px-4 py-0.5 text-fg-subtle">
                  <span className="w-12 text-right pr-4 select-none opacity-40 font-code-gutter">41</span>
                  <span className="w-6 text-center select-none opacity-30">&nbsp;</span>
                  <span>{"  const b = computeHash(storedToken);"}</span>
                </div>

                {/* Deletion line */}
                <div className="flex items-center bg-diff-deletion-line text-diff-deletion-text px-4 py-0.5">
                  <span className="w-12 text-right pr-4 select-none opacity-50 font-code-gutter">42</span>
                  <span className="w-6 text-center select-none font-bold">−</span>
                  <span>{"  const safe = crypto.timingSafeEqual(a, b);"}</span>
                </div>

                {/* Addition line */}
                <div className="flex items-center bg-diff-addition-line text-diff-addition-text px-4 py-0.5">
                  <span className="w-12 text-right pr-4 select-none opacity-50 font-code-gutter">43</span>
                  <span className="w-6 text-center select-none font-bold">+</span>
                  <span>{"  const safe = crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));"}</span>
                </div>

                {/* Context line after */}
                <div className="flex items-center px-4 py-0.5 text-fg-subtle">
                  <span className="w-12 text-right pr-4 select-none opacity-40 font-code-gutter">44</span>
                  <span className="w-6 text-center select-none opacity-30">&nbsp;</span>
                  <span>{"  return safe;"}</span>
                </div>
              </div>

              {/* Annotation card */}
              <div className="mx-4 my-4">
                <div className="flex items-start gap-3 p-4 rounded-none border border-border-default bg-surface-container">
                  <AlertTriangle size={20} className="text-error mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                        Timing Attack Vulnerability
                      </span>
                      <span className="font-badge-mono text-badge-mono px-1.5 py-0.5 rounded bg-surface-container-high text-error border border-border-default">
                        security
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-fg-muted">
                      String arguments to <code className="px-1 py-0.5 bg-canvas-inset text-fg-default font-code-diff text-code-diff">timingSafeEqual</code> are deprecated and susceptible to timing attacks if the encoding length varies. Use Buffers instead.
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 font-badge-mono text-badge-mono text-fg-subtle">
                        <ShieldCheck size={14} />
                        Auto-fixable
                      </span>
                      <span className="flex items-center gap-1 font-badge-mono text-badge-mono text-fg-subtle">
                        <Clock size={14} />
                        Detected in 1.2s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ═══════════════════════════════════════════
            FEATURES (Apple Style Single-Column)
            ═══════════════════════════════════════════ */}
        <section className="px-6 py-32 max-w-[1024px] mx-auto">
          <FadeIn className="text-center mb-24">
            <h2 className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight">
              Everything you need to ship bulletproof code.
            </h2>
            <p className="font-body-base text-body-base text-fg-muted mt-4 max-w-xl mx-auto">
              From automated code review to incident analysis, Kareixo covers the full development lifecycle.
            </p>
          </FadeIn>

          <div className="flex flex-col gap-32">
            {FEATURES.map((feature, i) => (
              <FadeIn
                key={feature.title}
                delay={0.1}
                className={`flex flex-col gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center`}
              >
                <div className="flex-1 text-center md:text-left">
                  <div className="w-12 h-12 bg-surface-container flex items-center justify-center mb-6 mx-auto md:mx-0 text-fg-default">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="font-title-card text-title-card text-fg-default font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="font-body-base text-body-base text-fg-muted">
                    {feature.description}
                  </p>
                </div>
                <div className="flex-1 w-full bg-surface-container border border-border-default h-[300px] flex items-center justify-center">
                  <span className="text-fg-subtle font-body-sm text-body-sm uppercase tracking-widest">Visual Placeholder</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            HOW IT WORKS (Numbered Vertical Sequence)
            ═══════════════════════════════════════════ */}
        <section id="how-it-works" className="px-6 py-32 bg-surface-container border-y border-border-default">
          <div className="max-w-[800px] mx-auto">
            <FadeIn className="text-center mb-20">
              <h2 className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight">
                Up and running in three steps.
              </h2>
            </FadeIn>

            <div className="relative border-l-2 border-border-default ml-4 md:ml-[50%]">
              {STEPS.map((step, i) => (
                <FadeIn key={step.title} delay={i * 0.15} className={`mb-16 last:mb-0 relative ${i % 2 === 0 ? "md:pr-16 md:-left-[50%]" : "md:pl-16 md:left-0"} pl-12 md:text-${i % 2 === 0 ? "right" : "left"}`}>
                  <div className={`absolute top-0 w-8 h-8 bg-canvas-default border-2 border-border-default flex items-center justify-center font-bold text-fg-default -left-[17px] md:left-auto md:right-auto md:-translate-x-[17px] ${i % 2 === 0 ? "md:right-0 md:translate-x-[17px]" : ""}`}>
                    {i + 1}
                  </div>
                  <h3 className="font-title-card-sm text-title-card-sm text-fg-default font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="font-body-base text-body-base text-fg-muted">
                    {step.description}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CTA BANNER
            ═══════════════════════════════════════════ */}
        <section className="px-6 py-32">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center card p-16">
              <h2 className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight mb-4">
                Ready to ship better code?
              </h2>
              <p className="font-body-base text-body-base text-fg-muted mb-10 max-w-lg mx-auto">
                Join thousands of developers who trust Kareixo to catch the bugs before production. Free for open source, always.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://github.com/apps/kareixo-reviewer/installations/new"
                  className="btn btn-primary inline-flex items-center justify-center gap-2.5"
                >
                  <Rocket size={18} />
                  Get Started for Free
                </a>
                <Link
                  href="/pricing"
                  className="btn btn-ghost inline-flex items-center justify-center gap-2"
                >
                  View Pricing
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-border-default bg-canvas-default">
        <div className="max-w-[1280px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
            {/* Brand column */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 font-semibold text-fg-default text-lg">
                <Image
                  src="/logo.png"
                  alt="Kareixo Logo"
                  width={26}
                  height={26}
                  className="object-contain"
                />
                Kareixo
              </div>
              <p className="font-body-sm text-body-sm text-fg-muted max-w-xs">
                AI-powered code review platform for GitHub. Deterministic static analysis and precision diagnostics on every pull request.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <a
                  href="https://github.com/karanray06/Kareixo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-surface-container border border-border-default flex items-center justify-center text-fg-muted hover:text-fg-default hover:border-fg-subtle transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                </a>
              </div>
            </div>

            {/* Product links */}
            <div className="flex flex-col gap-3">
              <span className="font-label-ui text-label-ui text-fg-default font-semibold uppercase tracking-wider mb-1">
                Product
              </span>
              <Link href="/dashboard" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">
                Dashboard
              </Link>
              <Link href="/codechat" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">
                CodeChat
              </Link>
              <Link href="/incident" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">
                Incident Tracer
              </Link>
              <Link href="/pricing" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">
                Pricing
              </Link>
            </div>

            {/* Legal links */}
            <div className="flex flex-col gap-3">
              <span className="font-label-ui text-label-ui text-fg-default font-semibold uppercase tracking-wider mb-1">
                Legal
              </span>
              <Link href="/privacy" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">
                Terms of Service
              </Link>
            </div>
            
            {/* Empty column instead of newsletter */}
            <div className="flex flex-col gap-3">
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-border-default flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-body-sm text-body-sm text-fg-subtle">
              © {new Date().getFullYear()} Kareixo. All rights reserved.
            </span>
            <span className="font-badge-mono text-badge-mono text-fg-subtle flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-fg-muted" />
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
