"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/landing/Navbar";

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

/* ── Feature card data ── */
const FEATURES = [
  {
    icon: "merge",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
    title: "Deterministic Static Analysis",
    description:
      "Every PR is analyzed by our AST engine. We find the bugs that regular linters miss — tracing logic paths across multiple files and enforcing architectural boundaries.",
    large: true,
  },
  {
    icon: "chat",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
    title: "CodeChat Intelligence",
    description:
      "Ask questions about your codebase directly. Kareixo reads your repo files in real-time to answer architecture and implementation questions with full context.",
  },
  {
    icon: "radar",
    color: "text-accent-red",
    bg: "bg-accent-red/10",
    title: "Incident Tracer",
    description:
      "Paste a production stack trace and watch the AST Blame Engine trace each frame back to the exact commit and PR that introduced the bug.",
  },
  {
    icon: "verified",
    color: "text-accent-green-emphasis",
    bg: "bg-accent-green-emphasis/10",
    title: "Zero Configuration",
    description:
      "No complex yaml files. Install the GitHub app, select your repositories, and Kareixo starts reviewing your code immediately.",
  },
];

/* ── Steps data ── */
const STEPS = [
  {
    icon: "download",
    title: "Install the App",
    description: "One-click GitHub App installation. Select the repos you want reviewed.",
  },
  {
    icon: "upload",
    title: "Push Your Code",
    description: "Open a pull request as you normally would. Kareixo activates automatically.",
  },
  {
    icon: "check_circle",
    title: "Get Reviewed",
    description: "Receive inline comments with actionable findings, verified by ground truth analysis.",
  },
];

/* ── Stats data ── */
const STATS = [
  { value: "50K+", label: "PRs Analyzed" },
  { value: "12K+", label: "Vulnerabilities Found" },
  { value: "3.2s", label: "Avg Review Time" },
  { value: "99.7%", label: "Uptime" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas-default text-fg-default font-body-base selection:bg-accent-blue/30 overflow-x-hidden">
      <Navbar />

      <main className="relative">
        {/* ═══════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════ */}
        <section className="relative min-h-[100vh] flex items-center justify-center px-6 overflow-hidden">
          {/* Gradient orbs */}
          <div className="orb orb-green w-[500px] h-[500px] top-[10%] left-[10%]" />
          <div className="orb orb-purple w-[600px] h-[600px] top-[20%] right-[5%]" />
          <div className="orb orb-blue w-[400px] h-[400px] bottom-[10%] left-[30%]" />

          {/* Noise texture overlay */}
          <div className="noise-overlay absolute inset-0" />

          {/* Grid pattern background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(var(--color-fg-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-fg-subtle) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />

          <div className="relative z-10 max-w-[1280px] mx-auto w-full flex flex-col items-center text-center stagger-children">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border-default bg-surface-container/50 backdrop-blur-sm text-fg-muted font-badge-mono text-badge-mono mb-8">
              <span className="w-2 h-2 rounded-full bg-accent-green-emphasis animate-pulse" />
              Kareixo AST Engine v2.4 — Live
            </div>

            {/* Main heading */}
            <h1 className="font-headline-hero text-[clamp(2rem,6vw,4rem)] leading-[1.1] tracking-[-0.03em] text-fg-default max-w-4xl font-semibold">
              Code Review That{" "}
              <span className="gradient-text">Actually Understands</span>
              <br />
              Your Code
            </h1>

            {/* Subtitle */}
            <p className="font-body-base text-[clamp(1rem,2vw,1.125rem)] text-fg-muted max-w-2xl mt-6 leading-relaxed">
              Kareixo analyzes pull requests with deterministic static analysis, catching logic flaws and security vulnerabilities before they reach production.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
              <a
                href="https://github.com/apps/kareixo-reviewer/installations/new"
                className="glow-button inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-accent-green-emphasis hover:bg-accent-green-hover text-white font-semibold text-base transition-all shadow-lg shadow-accent-green-emphasis/20"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Install on GitHub
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border-default bg-surface-container/30 backdrop-blur-sm text-fg-default font-semibold text-base transition-all hover:bg-surface-container-high hover:border-fg-subtle"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                View Dashboard
              </Link>
            </div>

            {/* Trust line */}
            <p className="mt-8 text-fg-subtle font-body-sm text-body-sm flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-accent-green-emphasis">check</span>
                Free for open source
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-accent-green-emphasis">check</span>
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-accent-green-emphasis">check</span>
                Setup in 60 seconds
              </span>
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
                  <span className="material-symbols-outlined text-[14px] text-fg-subtle">code</span>
                  <span className="font-code-diff text-code-diff text-fg-muted">src/auth.ts</span>
                </div>
                <div className="ml-auto">
                  <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-accent-red/10 text-accent-red border border-accent-red/20">
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
                <div className="flex items-start gap-3 p-4 rounded-lg border border-accent-amber/20 bg-accent-amber/5">
                  <span className="material-symbols-outlined text-accent-amber text-[20px] mt-0.5 flex-shrink-0">warning</span>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                        Timing Attack Vulnerability
                      </span>
                      <span className="font-badge-mono text-badge-mono px-1.5 py-0.5 rounded bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                        security
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-fg-muted leading-relaxed">
                      String arguments to <code className="px-1 py-0.5 rounded bg-surface-container text-fg-default font-code-diff text-code-diff">timingSafeEqual</code> are deprecated and susceptible to timing attacks if the encoding length varies. Use Buffers instead.
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 font-badge-mono text-badge-mono text-accent-green-emphasis">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Auto-fixable
                      </span>
                      <span className="flex items-center gap-1 font-badge-mono text-badge-mono text-fg-subtle">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
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
            FEATURE BENTO GRID
            ═══════════════════════════════════════════ */}
        <section className="px-6 py-24 max-w-[1280px] mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight">
              Everything you need to ship{" "}
              <span className="gradient-text">bulletproof code</span>
            </h2>
            <p className="font-body-base text-body-base text-fg-muted mt-4 max-w-xl mx-auto">
              From automated code review to incident analysis, Kareixo covers the full development lifecycle.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((feature, i) => (
              <FadeIn
                key={feature.title}
                delay={i * 0.1}
                className={feature.large ? "md:col-span-2" : ""}
              >
                <div className="glass-card p-8 h-full group">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110`}>
                    <span className={`material-symbols-outlined text-[24px] ${feature.color}`}>
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="font-title-card text-title-card text-fg-default font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-fg-muted leading-relaxed max-w-lg">
                    {feature.description}
                  </p>

                  {/* Mini code snippet for the large card */}
                  {feature.large && (
                    <div className="mt-6 rounded-lg border border-border-default bg-canvas-inset p-4 font-code-diff text-code-diff text-fg-muted overflow-x-auto">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border-muted">
                        <span className="w-2 h-2 rounded-full bg-accent-green-emphasis" />
                        <span className="text-fg-subtle">Analysis running across 3 files...</span>
                      </div>
                      <div className="space-y-0.5 text-sm">
                        <div><span className="text-accent-purple">import</span> {"{"} validateInput {"}"} <span className="text-accent-purple">from</span> <span className="text-accent-blue">&quot;./validators&quot;</span></div>
                        <div><span className="text-accent-purple">import</span> {"{"} sanitizeSQL {"}"} <span className="text-accent-purple">from</span> <span className="text-accent-blue">&quot;./sanitizers&quot;</span></div>
                        <div className="mt-2 pl-4 border-l-2 border-accent-amber text-accent-amber">
                          ⚠ validateInput() does not call sanitizeSQL() — raw input reaches DB query on line 87
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            HOW IT WORKS
            ═══════════════════════════════════════════ */}
        <section id="how-it-works" className="px-6 py-24 bg-canvas-subtle/50 border-y border-border-default">
          <div className="max-w-[1280px] mx-auto">
            <FadeIn className="text-center mb-16">
              <h2 className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight">
                Up and running in <span className="gradient-text-green">three steps</span>
              </h2>
              <p className="font-body-base text-body-base text-fg-muted mt-4 max-w-xl mx-auto">
                No configuration files. No complex setup. Just install and ship.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
              {/* Connector lines (desktop only) */}
              <div className="hidden md:block absolute top-[52px] left-[calc(33.33%+12px)] right-[calc(33.33%+12px)] h-[1px] bg-gradient-to-r from-border-default via-fg-subtle to-border-default" />

              {STEPS.map((step, i) => (
                <FadeIn key={step.title} delay={i * 0.15}>
                  <div className="flex flex-col items-center text-center">
                    {/* Step number + icon */}
                    <div className="relative mb-6">
                      <div className="w-[88px] h-[88px] rounded-2xl bg-surface-container border border-border-default flex items-center justify-center transition-all duration-300 hover:border-fg-subtle hover:shadow-lg hover:shadow-accent-green-emphasis/5">
                        <span className="material-symbols-outlined text-[32px] text-fg-default">
                          {step.icon}
                        </span>
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent-green-emphasis text-white font-badge-mono text-badge-mono flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                    </div>

                    <h3 className="font-title-card text-title-card text-fg-default font-semibold mb-2">
                      {step.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-fg-muted leading-relaxed max-w-xs">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            STATS STRIP
            ═══════════════════════════════════════════ */}
        <section id="security" className="px-6 py-20">
          <div className="max-w-[1280px] mx-auto">
            <FadeIn>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center group">
                    <div className="font-headline-hero text-[clamp(2rem,4vw,3rem)] font-semibold text-fg-default tracking-tight transition-colors duration-300 group-hover:text-accent-green-emphasis">
                      {stat.value}
                    </div>
                    <div className="font-body-sm text-body-sm text-fg-muted mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CTA BANNER
            ═══════════════════════════════════════════ */}
        <section className="px-6 py-24">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center glass-card p-12 md:p-16 relative overflow-hidden">
              {/* Background accent */}
              <div className="orb orb-green w-[300px] h-[300px] -top-[100px] -left-[100px] opacity-50" />
              <div className="orb orb-purple w-[250px] h-[250px] -bottom-[80px] -right-[80px] opacity-40" />

              <div className="relative z-10">
                <h2 className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight mb-4">
                  Ready to ship better code?
                </h2>
                <p className="font-body-base text-body-base text-fg-muted mb-8 max-w-lg mx-auto">
                  Join thousands of developers who trust Kareixo to catch the bugs before production. Free for open source, always.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="https://github.com/apps/kareixo-reviewer/installations/new"
                    className="glow-button inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-accent-green-emphasis hover:bg-accent-green-hover text-white font-semibold text-base transition-all shadow-lg shadow-accent-green-emphasis/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                    Get Started for Free
                  </a>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-fg-muted hover:text-fg-default font-semibold text-base transition-colors"
                  >
                    View Pricing
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-border-default bg-canvas-subtle/30">
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
                  className="rounded-lg object-contain"
                />
                Kareixo
              </div>
              <p className="font-body-sm text-body-sm text-fg-muted max-w-xs leading-relaxed">
                AI-powered code review platform for GitHub. Deterministic static analysis and precision diagnostics on every pull request.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <a
                  href="https://github.com/karanray06/Kareixo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-surface-container border border-border-default flex items-center justify-center text-fg-muted hover:text-fg-default hover:border-fg-subtle transition-all"
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

            {/* Newsletter signup */}
            <div className="flex flex-col gap-3">
              <span className="font-label-ui text-label-ui text-fg-default font-semibold uppercase tracking-wider mb-1">
                Stay Updated
              </span>
              <p className="font-body-sm text-body-sm text-fg-muted">
                Get product updates and security advisories.
              </p>
              <form className="flex gap-2 mt-1" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="input flex-1 !py-2 !text-sm rounded-lg"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-accent-green-emphasis hover:bg-accent-green-hover text-white font-semibold text-sm transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-border-muted flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-body-sm text-body-sm text-fg-subtle">
              © {new Date().getFullYear()} Kareixo. All rights reserved.
            </span>
            <span className="font-badge-mono text-badge-mono text-fg-subtle flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green-emphasis animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
