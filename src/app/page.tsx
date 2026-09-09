import Link from 'next/link';
import HeroShader from '@/components/landing/HeroShader';

export default function Home() {
  return (
    <>
      

<HeroShader />

<div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#09090B_100%)] opacity-90"></div>
<div className="fixed inset-0 pointer-events-none z-0 grid-glow-subtle opacity-35"></div>

<header className="fixed top-0 left-0 right-0 z-50 bg-[#09090B]/75 backdrop-blur-2xl border-b border-dark-border/60"><div className="h-16 max-w-[1280px] mx-auto px-6 lg:px-12 flex items-center justify-between"><div className="flex items-center gap-8"><a className="flex items-center gap-2.5 group" data-path="landing-page" href="#"><div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-secondary transition-colors"><img alt="Profile" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1UWIz4RfzHyOZlfOGvhBUtg7-6QYbUcT3ET13ztA2Vs2YWxd0ssaKyKmSb9Oco1LKHUyj6kVc6Nq1alUKokL6GBciJqGHkqfg-r5egq331YZbd0pVbivKzpx29lXbLvXyNHSDUP2lAfjV3r_W4wKD3WplLQg2wU0vFmCODrB8Z5S857jA9VXxAGUBE6V0YwoEwOGU0spcQKzqWJliJS-hz2RrMy58OUNVKioV3ZFU3zHVGRy_urdd9_P8HRCezeWvWwuE5qYIwy-A"/></div><span className="font-title-card-sm text-title-card-sm tracking-tight text-dark-text-primary flex items-center gap-1.5">Kareixo</span></a><nav className="hidden md:flex items-center gap-6" data-active-classes="text-dark-text-primary font-medium"><a className="font-label-ui text-label-ui text-dark-text-secondary hover:text-dark-text-primary transition-colors" data-path="product" href="#stage-engine">Engine</a><a className="font-label-ui text-label-ui text-dark-text-secondary hover:text-dark-text-primary transition-colors" data-path="how-it-works" href="#how-it-works">Timeline</a><a className="font-label-ui text-label-ui text-dark-text-secondary hover:text-dark-text-primary transition-colors" data-path="security" href="#security-vault">Zero-Retention Vault</a><a className="font-label-ui text-label-ui text-dark-text-secondary hover:text-dark-text-primary transition-colors" data-path="kareixo-chat" href="#kareixo-chat">Chat Shell</a><a className="font-label-ui text-label-ui text-dark-text-secondary hover:text-dark-text-primary transition-colors" href="https://github.com" rel="noreferrer" target="_blank">GitHub</a></nav></div><div className="flex items-center gap-3">

<div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-elevated/60 border border-dark-border text-[11px] font-badge-mono text-dark-text-muted">
<span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
<span>AST CLUSTER ACTIVE</span>
</div>
<a className="hidden sm:inline-flex items-center justify-center font-label-ui text-label-ui text-dark-text-secondary hover:text-dark-text-primary px-3 py-2 transition-colors" data-path="sign-in" href="/dashboard">Sign in</a><a className="inline-flex items-center justify-center h-10 px-[18px] rounded-lg bg-gradient-to-r from-secondary to-accent-ai-hover text-white font-label-ui text-label-ui shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all duration-200 hover:-translate-y-[1px]" data-path="install" href="/dashboard">Install on GitHub</a></div></div></header>
<main className="w-full pt-20 flex-1 relative z-10"><div className="flex flex-col w-full">

<section className="w-full pt-16 pb-24 px-6 lg:px-12 max-w-[1280px] mx-auto flex flex-col items-center text-center perspective-cinema relative">

<div className="hidden xl:block absolute left-8 top-28 preserve-3d transition-transform duration-300 pointer-events-none data-parallax-float" data-depth="0.08">
<div className="px-3.5 py-2 rounded-xl stage-blur-card text-left shadow-2xl border border-secondary/30 transform -rotate-6">
<div className="text-[10px] font-badge-mono text-secondary uppercase tracking-widest flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> AST Node Injected
    </div>
<div className="font-code-diff text-[12px] text-dark-text-primary mt-1">const safe = crypto.timingSafeEqual</div>
</div>
</div>
<div className="hidden xl:block absolute right-8 top-36 preserve-3d transition-transform duration-300 pointer-events-none data-parallax-float" data-depth="-0.09">
<div className="px-3.5 py-2 rounded-xl stage-blur-card text-left shadow-2xl border border-success/30 transform rotate-6">
<div className="text-[10px] font-badge-mono text-success uppercase tracking-widest flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-success"></span> Latency Verified
    </div>
<div className="font-code-diff text-[12px] text-dark-text-primary mt-1">12ms · Zero Cache Leak</div>
</div>
</div>



<h1 className="font-display-hero text-display-hero md:text-[80px] md:leading-[88px] text-dark-text-primary tracking-tight max-w-5xl mx-auto mb-6 drop-shadow-sm">
      Ship better code.<br/>
<span className="bg-gradient-to-r from-zinc-200 via-purple-300 to-secondary bg-clip-text text-transparent">Automatically in 3D Motion.</span>
</h1>

<p className="font-body-base text-body-base md:text-lg text-dark-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
      Kareixo reviews pull requests with deterministic spatial AI, catching logic flaws and security leaks before production. Fluid, live-streamed code intelligence directly in your GitHub flow.
    </p>

<div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-6">
<a className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-xl bg-white text-black font-semibold font-label-ui text-label-ui shadow-2xl hover:bg-zinc-200 transition-all duration-200 hover:-translate-y-0.5" data-path="install" href="/dashboard">
<svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
<path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
</svg>
<span>Install on GitHub</span>
</a>
<a className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-xl stage-blur-card text-dark-text-primary font-label-ui text-label-ui border border-dark-border shadow-md hover:border-secondary hover:text-white transition-all duration-200 hover:-translate-y-0.5 group" href="#stage-engine">
<span className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[14px]">play_arrow</span>
</span>
<span>Watch Engine Simulation</span>
</a>
</div>

<div className="flex items-center gap-3 font-badge-mono text-badge-mono text-dark-text-muted mt-2">
<span>Free forever</span>
<span className="text-dark-border-strong">·</span>
<span>No configuration</span>
<span className="text-dark-border-strong">·</span>
<span>Deterministic AST Verification</span>
</div>
</section>

<section className="w-full pb-32 px-6 lg:px-12 max-w-[1140px] mx-auto perspective-cinema" id="stage-engine">

<div className="preserve-3d transition-transform duration-700 ease-out rounded-2xl border border-white/10 stage-blur-card shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(107,56,212,0.15)] overflow-hidden relative" id="hero-3d-card" style={{ transform: "rotateX(8deg) translateY(0px)" }}>

<div className="px-6 py-4 bg-dark-surface/90 border-b border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="flex items-center gap-1.5">
<div className="w-3 h-3 rounded-full bg-red-500/80"></div>
<div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
<div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
</div>
<span className="text-dark-border-strong mx-1">|</span>
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-secondary/20 text-secondary border border-secondary/30 font-badge-mono text-[11px]">
<span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            STREAM REC · 60 FPS
          </span>
<span className="font-badge-mono text-badge-mono text-dark-text-muted hidden sm:inline">kareixo-kernel:worker-09</span>
</div>
</div>

<div className="flex items-center gap-4 text-[11px] font-badge-mono">
<div className="flex items-center gap-1.5 text-success">
<span className="material-symbols-outlined text-[14px]">bolt</span>
<span>Webhook: 12ms</span>
</div>
<div className="flex items-center gap-1.5 text-secondary">
<span className="material-symbols-outlined text-[14px]">psychology</span>
<span>AST: Active</span>
</div>
<div className="flex items-center gap-1.5 text-dark-text-secondary">
<span className="material-symbols-outlined text-[14px]">memory</span>
<span>Memory: 0KB Persisted</span>
</div>
</div>
</div>

<div className="px-6 py-4 bg-[#0e0e11]/80 border-b border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
<div className="flex flex-col gap-1.5">
<div className="flex flex-wrap items-center gap-2">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-badge-mono text-badge-mono">
<span className="material-symbols-outlined text-[14px]">done</span>
            Open PR
          </span>
<span className="font-title-card-sm text-title-card-sm text-dark-text-primary">Add authentication middleware &amp; timing defense</span>
<span className="font-badge-mono text-badge-mono text-dark-text-muted">#284</span>
</div>
<div className="flex flex-wrap items-center gap-2 font-body-sm text-body-sm text-dark-text-secondary">
<span>by <strong className="text-dark-text-primary font-medium">alexdev</strong></span>
<span>·</span>
<span className="inline-flex items-center gap-1 font-badge-mono text-badge-mono bg-dark-surface px-2 py-0.5 rounded border border-dark-border">
            feat/auth-middleware
          </span>
<span>into</span>
<span className="inline-flex items-center gap-1 font-badge-mono text-badge-mono bg-dark-surface px-2 py-0.5 rounded border border-dark-border">
            main
          </span>
</div>
</div>

<div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-surface-elevated/90 border border-dark-border self-start md:self-auto shadow-inner">
<span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
<div className="text-left font-body-sm text-body-sm">
<span className="text-dark-text-primary font-medium">Kareixo 3D Engine</span>
<span className="text-secondary font-badge-mono text-badge-mono ml-1.5">Auto-Patched (1-Click)</span>
</div>
</div>
</div>

<div className="px-6 py-3 bg-[#0d0d10] border-b border-dark-border flex items-center justify-between font-badge-mono text-badge-mono text-dark-text-secondary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-dark-text-muted">description</span>
<span className="font-semibold text-dark-text-primary">src/middleware/auth.ts</span>
</div>
<div className="flex items-center gap-3">
<span className="text-emerald-400 font-medium">+14</span>
<span className="text-rose-400 font-medium">-3</span>
<span className="text-dark-border-strong">|</span>
<span className="text-dark-text-muted">Commit 7f9a12c</span>
</div>
</div>

<div className="font-code-diff text-code-diff bg-dark-background/95 overflow-x-auto select-none relative">

<div className="absolute inset-x-0 h-16 bg-gradient-to-b from-secondary/15 via-secondary/5 to-transparent pointer-events-none animate-scanline"></div>
<div className="flex items-stretch hover:bg-white/[0.02]">
<span className="w-12 py-1 px-3 text-right text-dark-text-muted font-code-gutter select-none bg-dark-surface/40 border-r border-dark-border">42</span>
<span className="w-6 py-1 text-center text-dark-text-muted select-none"> </span>
<span className="py-1 px-4 text-dark-text-secondary">export async function authMiddleware(req: Request, res: Response, next: NextFunction) &#123;</span>
</div>
<div className="flex items-stretch hover:bg-white/[0.02]">
<span className="w-12 py-1 px-3 text-right text-dark-text-muted font-code-gutter select-none bg-dark-surface/40 border-r border-dark-border">43</span>
<span className="w-6 py-1 text-center text-dark-text-muted select-none"> </span>
<span className="py-1 px-4 text-dark-text-secondary">  const authHeader = req.headers.authorization;</span>
</div>
<div className="flex items-stretch bg-rose-950/25 hover:bg-rose-950/35 border-l-2 border-rose-500">
<span className="w-12 py-1 px-3 text-right text-rose-400 font-code-gutter select-none bg-rose-950/40 border-r border-rose-500/20">44</span>
<span className="w-6 py-1 text-center text-rose-400 select-none font-bold">-</span>
<span className="py-1 px-4 text-dark-text-secondary line-through opacity-75">  const token = authHeader.split(&apos; &apos;)[1];</span>
</div>
<div className="flex items-stretch bg-emerald-950/25 hover:bg-emerald-950/35 border-l-2 border-emerald-500">
<span className="w-12 py-1 px-3 text-right text-emerald-400 font-code-gutter select-none bg-emerald-950/40 border-r border-emerald-500/20">45</span>
<span className="w-6 py-1 text-center text-emerald-400 select-none font-bold">+</span>
<span className="py-1 px-4 text-emerald-300 font-medium">  const token = req.headers[&apos;authorization&apos;]?.split(&apos; &apos;)[1];</span>
</div>

<div className="p-4 sm:p-6 bg-gradient-to-r from-dark-surface/90 via-dark-surface-elevated/95 to-dark-surface/90 border-y border-dark-border">
<div className="max-w-3xl ml-2 sm:ml-10 p-5 rounded-xl bg-[#131317]/95 border-l-4 border-l-secondary border border-white/10 shadow-2xl relative group">
<div className="flex items-center justify-between mb-3 flex-wrap gap-2">
<div className="flex items-center gap-2.5">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-badge-mono text-badge-mono">
<span className="material-symbols-outlined text-[14px]">warning</span>
                Security · High severity
              </span>
<span className="font-label-ui text-label-ui text-secondary font-medium flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Kareixo Automated Review
              </span>
</div>
<span className="font-badge-mono text-badge-mono text-dark-text-muted">Rule: SEC-041 (Timing safe comparison)</span>
</div>
<p className="font-body-sm text-body-sm text-dark-text-secondary mb-3">
            Token should be validated before use. Unvalidated input can reach downstream verification branches and cause unhandled exceptions when header malformations occur.
          </p>
<div className="p-3.5 rounded-lg bg-black/60 font-code-diff text-code-diff text-dark-text-primary mb-4 border border-dark-border">
<span className="text-dark-text-muted">// Suggested safe verification pattern &amp; timing safety:</span><br/>
<span className="text-secondary font-medium">if (!token || !isValidBearerFormat(token)) &#123;</span><br/>
              <span className="text-dark-text-secondary">return res.status(401).json(&#123; error: &apos;Invalid or missing bearer token&apos; &#125;);</span><br/>
<span className="text-secondary font-medium">&#125;</span><br/>
<span className="text-emerald-400 font-medium">const isSigValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));</span>
</div>
<div className="flex flex-wrap items-center gap-3">
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white font-label-ui text-label-ui shadow-lg shadow-secondary/30 hover:bg-accent-ai-hover transition-all">
<span className="material-symbols-outlined text-[16px]">done_all</span>
              Apply suggestion (1 click commit)
            </button>
<button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-dark-surface text-dark-text-secondary font-label-ui text-label-ui border border-dark-border hover:text-white transition-colors">
              Inspect AST Difference
            </button>
</div>
</div>
</div>
<div className="flex items-stretch hover:bg-white/[0.02]">
<span className="w-12 py-1 px-3 text-right text-dark-text-muted font-code-gutter select-none bg-dark-surface/40 border-r border-dark-border">46</span>
<span className="w-6 py-1 text-center text-dark-text-muted select-none"> </span>
<span className="py-1 px-4 text-dark-text-secondary">  const decoded = await verifyToken(token);</span>
</div>
<div className="flex items-stretch hover:bg-white/[0.02]">
<span className="w-12 py-1 px-3 text-right text-dark-text-muted font-code-gutter select-none bg-dark-surface/40 border-r border-dark-border">47</span>
<span className="w-6 py-1 text-center text-dark-text-muted select-none"> </span>
<span className="py-1 px-4 text-dark-text-secondary">  req.user = decoded;</span>
</div>
<div className="flex items-stretch hover:bg-white/[0.02]">
<span className="w-12 py-1 px-3 text-right text-dark-text-muted font-code-gutter select-none bg-dark-surface/40 border-r border-dark-border">48</span>
<span className="w-6 py-1 text-center text-dark-text-muted select-none"> </span>
<span className="py-1 px-4 text-dark-text-secondary">  next();</span>
</div>
<div className="flex items-stretch hover:bg-white/[0.02]">
<span className="w-12 py-1 px-3 text-right text-dark-text-muted font-code-gutter select-none bg-dark-surface/40 border-r border-dark-border">49</span>
<span className="w-6 py-1 text-center text-dark-text-muted select-none"> </span>
<span className="py-1 px-4 text-dark-text-secondary">&#125;</span>
</div>
</div>

<div className="px-6 py-3.5 bg-dark-surface border-t border-dark-border flex flex-wrap items-center justify-between gap-4 font-badge-mono text-badge-mono text-dark-text-secondary">
<div className="flex items-center gap-4">
<span>12 files changed</span>
<span>·</span>
<span className="text-dark-text-primary font-medium">4 findings</span>
<span>·</span>
<span className="text-emerald-400 font-medium">2 resolved</span>
</div>
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
<span className="text-emerald-400 font-medium">Passed with suggestions</span>
</div>
</div>
</div>
</section>

<section className="w-full border-y border-dark-border bg-dark-surface/60 py-6 px-6 lg:px-12 backdrop-blur-md relative z-10">
<div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-6 font-badge-mono text-badge-mono uppercase tracking-wider text-dark-text-muted">
<div className="flex items-center gap-2 hover:text-white transition-colors">
<span className="material-symbols-outlined text-[18px] text-secondary">terminal</span>
<span>Built for developers</span>
</div>
<span className="hidden sm:inline text-dark-border-strong">·</span>
<div className="flex items-center gap-2 hover:text-white transition-colors">
<span className="material-symbols-outlined text-[18px] text-secondary">hub</span>
<span>GitHub-native</span>
</div>
<span className="hidden sm:inline text-dark-border-strong">·</span>
<div className="flex items-center gap-2 hover:text-white transition-colors">
<span className="material-symbols-outlined text-[18px] text-secondary">lock</span>
<span>Privacy conscious</span>
</div>
<span className="hidden sm:inline text-dark-border-strong">·</span>
<div className="flex items-center gap-2 hover:text-white transition-colors">
<span className="material-symbols-outlined text-[18px] text-secondary">memory</span>
<span>AI-powered</span>
</div>
<span className="hidden sm:inline text-dark-border-strong">·</span>
<div className="flex items-center gap-2 hover:text-white transition-colors">
<span className="material-symbols-outlined text-[18px] text-secondary">all_inclusive</span>
<span>Free forever</span>
</div>
</div>
</section>

<section className="w-full py-32 px-6 lg:px-12 max-w-[1280px] mx-auto relative perspective-cinema" id="how-it-works">
<div className="mb-20 max-w-2xl">
<div className="font-badge-mono text-badge-mono uppercase tracking-widest text-secondary mb-2 flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-secondary"></span> Workflow Sequence
    </div>
<h2 className="font-headline-section text-headline-section text-dark-text-primary tracking-tight mb-4">
      From pull request to reviewed code in 18 seconds.
    </h2>
<p className="font-body-base text-body-base text-dark-text-secondary">
      Kareixo fits directly into the workflow your team already uses. No new tabs, no clunky command lines, no context switching.
    </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

<div className="scroll-tilt-card p-8 rounded-2xl stage-blur-card border border-white/10 flex flex-col justify-between group transition-all duration-300 hover:border-secondary hover:-translate-y-2">
<div>
<div className="flex items-center justify-between mb-8">
<span className="w-9 h-9 rounded-xl bg-surface-subtle border border-dark-border flex items-center justify-center font-badge-mono text-sm text-secondary font-bold group-hover:scale-110 transition-transform">01</span>
<span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 font-badge-mono text-[11px] text-dark-text-muted">read:pull_requests</span>
</div>
<h3 className="font-title-card text-title-card text-dark-text-primary mb-3">Connect GitHub</h3>
<p className="font-body-base text-body-base text-dark-text-secondary mb-6 leading-relaxed">
          Install the Kareixo GitHub App on your repository in under 30 seconds with fine-grained repository access permissions.
        </p>
</div>
<div className="p-3.5 bg-black/40 rounded-xl border border-dark-border flex items-center justify-between font-badge-mono text-badge-mono text-dark-text-secondary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-emerald-400">verified_user</span>
<span>App Permissions</span>
</div>
<span className="text-dark-text-primary font-medium">Minimal Scope</span>
</div>
</div>

<div className="scroll-tilt-card p-8 rounded-2xl stage-blur-card border border-white/10 flex flex-col justify-between group transition-all duration-300 hover:border-secondary hover:-translate-y-2">
<div>
<div className="flex items-center justify-between mb-8">
<span className="w-9 h-9 rounded-xl bg-surface-subtle border border-dark-border flex items-center justify-center font-badge-mono text-sm text-secondary font-bold group-hover:scale-110 transition-transform">02</span>
<span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 font-badge-mono text-[11px] text-dark-text-muted">event:pull_request.opened</span>
</div>
<h3 className="font-title-card text-title-card text-dark-text-primary mb-3">Open a pull request</h3>
<p className="font-body-base text-body-base text-dark-text-secondary mb-6 leading-relaxed">
          Kareixo automatically detects new and updated pull requests instantly via secure webhooks and schedules volatile inspection.
        </p>
</div>
<div className="p-3.5 bg-black/40 rounded-xl border border-dark-border flex items-center justify-between font-badge-mono text-badge-mono text-dark-text-secondary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-sky-400">bolt</span>
<span>Webhook Latency</span>
</div>
<span className="text-dark-text-primary font-medium">&lt; 280ms</span>
</div>
</div>

<div className="scroll-tilt-card p-8 rounded-2xl stage-blur-card border border-white/10 flex flex-col justify-between group transition-all duration-300 hover:border-secondary hover:-translate-y-2">
<div>
<div className="flex items-center justify-between mb-8">
<span className="w-9 h-9 rounded-xl bg-surface-subtle border border-dark-border flex items-center justify-center font-badge-mono text-sm text-secondary font-bold group-hover:scale-110 transition-transform">03</span>
<span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 font-badge-mono text-[11px] text-dark-text-muted">review:comments</span>
</div>
<h3 className="font-title-card text-title-card text-dark-text-primary mb-3">Get actionable feedback</h3>
<p className="font-body-base text-body-base text-dark-text-secondary mb-6 leading-relaxed">
          Receive review findings, automated suggestions, and security analysis directly in GitHub review comments ready to commit.
        </p>
</div>
<div className="p-3.5 bg-black/40 rounded-xl border border-dark-border flex items-center justify-between font-badge-mono text-badge-mono text-dark-text-secondary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">forum</span>
<span>Inline Suggestions</span>
</div>
<span className="text-dark-text-primary font-medium">1-Click Apply</span>
</div>
</div>
</div>
</section>

<section className="w-full py-28 px-6 lg:px-12 bg-dark-surface/40 border-y border-dark-border relative z-10 backdrop-blur-sm">
<div className="max-w-[1280px] mx-auto">
<div className="mb-16 max-w-2xl">
<div className="font-badge-mono text-badge-mono uppercase tracking-widest text-secondary mb-2 flex items-center gap-2">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Detection Matrix
      </div>
<h2 className="font-headline-section text-headline-section text-dark-text-primary tracking-tight mb-4">
        Find problems before they become production problems.
      </h2>
<p className="font-body-base text-body-base text-dark-text-secondary">
        Comprehensive, deterministic analysis across every layer of your codebase without the noise of naive linters.
      </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

<div className="scroll-tilt-card p-8 rounded-2xl stage-blur-card border border-white/10 hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1 group">
<div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[24px]">alt_route</span>
</div>
<h3 className="font-title-card text-title-card text-dark-text-primary mb-2">Logic errors</h3>
<p className="font-body-base text-body-base text-dark-text-secondary leading-relaxed">
          Catch edge cases, incorrect conditions, async mistakes, unhandled rejections, and flawed application logic before deployment.
        </p>
</div>

<div className="scroll-tilt-card p-8 rounded-2xl stage-blur-card border border-white/10 hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1 group">
<div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[24px]">shield</span>
</div>
<h3 className="font-title-card text-title-card text-dark-text-primary mb-2">Security flaws</h3>
<p className="font-body-base text-body-base text-dark-text-secondary leading-relaxed">
          Detect injection risks, unsafe input handling, secret exposure, CORS misconfigurations, and vulnerable package patterns.
        </p>
</div>

<div className="scroll-tilt-card p-8 rounded-2xl stage-blur-card border border-white/10 hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1 group">
<div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[24px]">speed</span>
</div>
<h3 className="font-title-card text-title-card text-dark-text-primary mb-2">Performance issues</h3>
<p className="font-body-base text-body-base text-dark-text-secondary leading-relaxed">
          Identify inefficient queries, N+1 loading anti-patterns, unnecessary client re-renders, memory leaks, and expensive blocking calls.
        </p>
</div>

<div className="scroll-tilt-card p-8 rounded-2xl stage-blur-card border border-white/10 hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1 group">
<div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[24px]">auto_fix_high</span>
</div>
<h3 className="font-title-card text-title-card text-dark-text-primary mb-2">Code quality</h3>
<p className="font-body-base text-body-base text-dark-text-secondary leading-relaxed">
          Improve readability, consistency, maintainability, type safety, strict null handling, and the overall developer experience.
        </p>
</div>
</div>
</div>
</section>

<section className="w-full py-28 px-6 lg:px-12 max-w-[1280px] mx-auto perspective-cinema">
<div className="mb-16 max-w-2xl">
<div className="font-badge-mono text-badge-mono uppercase tracking-widest text-secondary mb-2">Deep Diagnostics</div>
<h2 className="font-headline-section text-headline-section text-dark-text-primary tracking-tight mb-4">
      Reviews that explain themselves.
    </h2>
<p className="font-body-base text-body-base text-dark-text-secondary">
      Kareixo doesn&apos;t just flag a line of code. It explains why the issue matters and provides deterministic one-click remedies.
    </p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

<div className="lg:col-span-6 stage-blur-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
<div className="px-5 py-3.5 bg-dark-surface/90 border-b border-dark-border flex items-center justify-between font-badge-mono text-badge-mono text-dark-text-secondary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-dark-text-muted">code</span>
<span className="text-dark-text-primary font-medium">db/queries.ts</span>
</div>
<span>Line 108</span>
</div>
<div className="font-code-diff text-code-diff p-5 space-y-1 bg-black/60">
<div className="text-dark-text-muted font-code-gutter">105  export async function searchUsers(rawQuery: string) &#123;</div>
<div className="text-dark-text-muted font-code-gutter">106    const db = await getDatabaseClient();</div>
<div className="text-dark-text-muted font-code-gutter">107</div>

<div className="bg-rose-950/30 p-2.5 -mx-5 border-l-4 border-rose-500 flex items-start gap-2">
<span className="text-rose-400 font-bold font-code-gutter">108</span>
<span className="text-dark-text-primary font-medium">
              const result = await db.query(<br/>
                `SELECT * FROM users WHERE email = &apos;$&#123;rawQuery&#125;&apos;`<br/>
              );
          </span>
</div>
<div className="text-dark-text-muted font-code-gutter pt-2">109    return result.rows;</div>
<div className="text-dark-text-muted font-code-gutter">110  &#125;</div>
</div>
<div className="p-4 bg-dark-surface border-t border-dark-border flex items-center justify-between font-badge-mono text-badge-mono">
<span className="text-rose-400 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Raw concatenation flagged
        </span>
<span className="text-dark-text-muted">CWE-89: SQL Injection</span>
</div>
</div>

<div className="lg:col-span-6 stage-blur-card rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl">
<div className="flex items-center justify-between mb-6">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/50 text-rose-400 border border-rose-500/30 font-badge-mono text-badge-mono">
<span className="material-symbols-outlined text-[14px]">gpp_maybe</span>
          Security issue · High
        </span>
<span className="font-badge-mono text-badge-mono text-secondary flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">psychology</span> Kareixo AST Engine
        </span>
</div>

<div className="mb-6">
<h4 className="font-label-ui text-label-ui text-dark-text-primary mb-1 uppercase tracking-wider text-xs font-semibold">Why it matters</h4>
<p className="font-body-base text-body-base text-dark-text-secondary leading-relaxed">
          Unvalidated input can reach the database layer leading to SQL injection. Attackers can bypass authentication logic or dump sensitive customer records.
        </p>
</div>

<div className="mb-6">
<h4 className="font-label-ui text-label-ui text-dark-text-primary mb-2 uppercase tracking-wider text-xs font-semibold">Suggested fix</h4>
<div className="bg-black/60 p-3.5 rounded-xl border border-dark-border font-code-diff text-code-diff text-dark-text-primary overflow-x-auto">
<span className="text-dark-text-muted">// Use parameterized queries instead:</span><br/>
          const result = await db.query(<br/>
            <span className="text-emerald-400 font-medium">&apos;SELECT * FROM users WHERE email = $1&apos;</span>,<br/>
            <span className="text-emerald-400 font-medium">[rawQuery]</span><br/>
          );
        </div>
</div>

<div className="flex flex-wrap items-center gap-3 pt-2">
<button className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-secondary text-white font-label-ui text-label-ui shadow-lg shadow-secondary/30 hover:bg-accent-ai-hover transition-colors">
<span className="material-symbols-outlined text-[18px]">verified</span>
          Apply suggestion
        </button>
<a className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-white/5 text-dark-text-secondary font-label-ui text-label-ui border border-white/10 hover:text-white hover:border-secondary transition-colors" href="#">
<span>Open in GitHub</span>
<span className="material-symbols-outlined text-[16px]">open_in_new</span>
</a>
</div>
</div>
</div>
</section>

<section className="w-full py-28 px-6 lg:px-12 bg-dark-surface/40 border-t border-dark-border relative z-10 backdrop-blur-sm">
<div className="max-w-[1280px] mx-auto">
<div className="mb-14 max-w-2xl">
<div className="font-badge-mono text-badge-mono uppercase tracking-widest text-secondary mb-2">Central Oversight</div>
<h2 className="font-headline-section text-headline-section text-dark-text-primary tracking-tight mb-4">
        A central command center for team code quality.
      </h2>
<p className="font-body-base text-body-base text-dark-text-secondary">
        Monitor your organization&apos;s pull request velocity, recurring issues, and resolution metrics from a single pane of glass.
      </p>
</div>

<div className="stage-blur-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

<div className="px-6 py-3.5 border-b border-dark-border bg-dark-surface/80 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
<div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
<div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
<span className="text-dark-border-strong ml-2">|</span>
<span className="font-badge-mono text-badge-mono text-dark-text-secondary">app.kareixo.dev/org/engineering</span>
</div>
<div className="flex items-center gap-2 font-badge-mono text-badge-mono text-dark-text-muted">
<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
<span>Live Cluster Sync</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">

<div className="md:col-span-3 border-r border-dark-border p-5 bg-dark-surface/40 flex flex-col justify-between">
<div className="space-y-1">
<div className="font-badge-mono text-[11px] uppercase tracking-wider text-dark-text-muted px-3 py-1 mb-1">Organization</div>
<a className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/10 text-white font-label-ui text-label-ui border border-white/10 shadow-sm" href="#">
<span className="material-symbols-outlined text-[18px]">dashboard</span>
<span>Overview</span>
</a>
<a className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-dark-text-secondary font-label-ui text-label-ui hover:text-white hover:bg-white/5 transition-colors" href="#">
<span className="material-symbols-outlined text-[18px]">folder_open</span>
<span>Repositories</span>
</a>
<a className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-dark-text-secondary font-label-ui text-label-ui hover:text-white hover:bg-white/5 transition-colors" href="#">
<span className="material-symbols-outlined text-[18px]">rule</span>
<span>Reviews</span>
</a>
<a className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-dark-text-secondary font-label-ui text-label-ui hover:text-white hover:bg-white/5 transition-colors" href="#">
<span className="material-symbols-outlined text-[18px]">settings</span>
<span>Settings</span>
</a>
</div>
<div className="p-3.5 rounded-xl bg-black/40 border border-dark-border">
<div className="font-badge-mono text-[11px] text-dark-text-muted mb-1">CAPACITY ROUTE</div>
<div className="flex items-center justify-between font-label-ui text-label-ui">
<span className="text-dark-text-primary">Cluster US-East</span>
<span className="text-emerald-400 font-medium">Optimal</span>
</div>
</div>
</div>

<div className="md:col-span-9 p-6 sm:p-8 flex flex-col justify-between bg-black/40">

<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
<div className="p-4 rounded-xl bg-dark-surface/80 border border-dark-border">
<span className="font-badge-mono text-badge-mono text-dark-text-muted">Total Reviews</span>
<div className="font-headline-section text-[32px] text-dark-text-primary mt-1 font-semibold">48</div>
</div>
<div className="p-4 rounded-xl bg-dark-surface/80 border border-dark-border">
<span className="font-badge-mono text-badge-mono text-dark-text-muted">Passed Clean</span>
<div className="font-headline-section text-[32px] text-emerald-400 mt-1 font-semibold">12</div>
</div>
<div className="p-4 rounded-xl bg-dark-surface/80 border border-dark-border">
<span className="font-badge-mono text-badge-mono text-dark-text-muted">Active Findings</span>
<div className="font-headline-section text-[32px] text-amber-400 mt-1 font-semibold">3</div>
</div>
<div className="p-4 rounded-xl bg-dark-surface/80 border border-dark-border">
<span className="font-badge-mono text-badge-mono text-dark-text-muted">Service Uptime</span>
<div className="font-headline-section text-[32px] text-dark-text-primary mt-1 font-semibold">99.4%</div>
</div>
</div>

<div className="border border-dark-border rounded-xl overflow-hidden bg-dark-surface/60">
<div className="px-5 py-3.5 bg-dark-surface/90 border-b border-dark-border flex items-center justify-between">
<span className="font-title-card-sm text-title-card-sm text-dark-text-primary">Recent Automated Reviews</span>
<span className="font-badge-mono text-badge-mono text-dark-text-muted">Updated 2m ago</span>
</div>
<div className="divide-y divide-dark-border font-body-sm text-body-sm">

<div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02]">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[20px] text-secondary">merge_type</span>
<div>
<div className="font-medium text-dark-text-primary">api-service / PR #284: Add auth middleware</div>
<div className="font-badge-mono text-[11px] text-dark-text-muted">feat/auth-middleware → main</div>
</div>
</div>
<div className="flex items-center gap-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-badge-mono text-[11px]">
                    Passed with suggestions
                  </span>
<span className="font-badge-mono text-[11px] text-dark-text-muted">2m ago</span>
</div>
</div>

<div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02]">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[20px] text-secondary">merge_type</span>
<div>
<div className="font-medium text-dark-text-primary">web-client / PR #109: Fix checkout state race</div>
<div className="font-badge-mono text-[11px] text-dark-text-muted">fix/checkout-race → main</div>
</div>
</div>
<div className="flex items-center gap-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-badge-mono text-[11px]">
                    Passed
                  </span>
<span className="font-badge-mono text-[11px] text-dark-text-muted">18m ago</span>
</div>
</div>

<div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02]">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[20px] text-secondary">merge_type</span>
<div>
<div className="font-medium text-dark-text-primary">analytics-worker / PR #45: Batch event sink</div>
<div className="font-badge-mono text-[11px] text-dark-text-muted">feat/batch-worker → staging</div>
</div>
</div>
<div className="flex items-center gap-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-badge-mono text-[11px]">
                    Passed
                  </span>
<span className="font-badge-mono text-[11px] text-dark-text-muted">1h ago</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-28 px-6 lg:px-12 max-w-[1280px] mx-auto perspective-cinema">
<div className="text-center max-w-2xl mx-auto mb-16">
<div className="font-badge-mono text-badge-mono uppercase tracking-widest text-secondary mb-2">Diagnostic Integrity</div>
<h2 className="font-headline-section text-headline-section text-dark-text-primary tracking-tight mb-4">
      AI review without the black box.
    </h2>
<p className="font-body-base text-body-base text-dark-text-secondary">
      Every suggestion is backed by concrete code traces and clear rationale. No hallucinated rules, no mysterious scorecards.
    </p>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
<div className="scroll-tilt-card p-6 rounded-2xl stage-blur-card border border-white/10 text-center flex flex-col items-center hover:border-secondary/40 transition-colors">
<span className="w-9 h-9 rounded-full bg-surface-subtle border border-dark-border flex items-center justify-center font-badge-mono text-badge-mono text-secondary mb-3">1</span>
<span className="font-title-card-sm text-title-card-sm text-dark-text-primary mb-1">Finding</span>
<p className="font-body-sm text-body-sm text-dark-text-secondary">Pinpoints exact AST nodes and changed lines.</p>
</div>
<div className="scroll-tilt-card p-6 rounded-2xl stage-blur-card border border-white/10 text-center flex flex-col items-center hover:border-secondary/40 transition-colors">
<span className="w-9 h-9 rounded-full bg-surface-subtle border border-dark-border flex items-center justify-center font-badge-mono text-badge-mono text-secondary mb-3">2</span>
<span className="font-title-card-sm text-title-card-sm text-dark-text-primary mb-1">Why it matters</span>
<p className="font-body-sm text-body-sm text-dark-text-secondary">Explains root cause impact and security risk.</p>
</div>
<div className="scroll-tilt-card p-6 rounded-2xl stage-blur-card border border-white/10 text-center flex flex-col items-center hover:border-secondary/40 transition-colors">
<span className="w-9 h-9 rounded-full bg-surface-subtle border border-dark-border flex items-center justify-center font-badge-mono text-badge-mono text-secondary mb-3">3</span>
<span className="font-title-card-sm text-title-card-sm text-dark-text-primary mb-1">Evidence</span>
<p className="font-body-sm text-body-sm text-dark-text-secondary">Provides call stack references and diff context.</p>
</div>
<div className="scroll-tilt-card p-6 rounded-2xl stage-blur-card border border-white/10 text-center flex flex-col items-center hover:border-secondary/40 transition-colors">
<span className="w-9 h-9 rounded-full bg-surface-subtle border border-dark-border flex items-center justify-center font-badge-mono text-badge-mono text-secondary mb-3">4</span>
<span className="font-title-card-sm text-title-card-sm text-dark-text-primary mb-1">Suggested fix</span>
<p className="font-body-sm text-body-sm text-dark-text-secondary">Produces a 1-click apply patch block.</p>
</div>
<div className="scroll-tilt-card p-6 rounded-2xl stage-blur-card border border-white/10 text-center flex flex-col items-center sm:col-span-2 lg:col-span-1 hover:border-secondary/40 transition-colors">
<span className="w-9 h-9 rounded-full bg-surface-subtle border border-dark-border flex items-center justify-center font-badge-mono text-badge-mono text-secondary mb-3">5</span>
<span className="font-title-card-sm text-title-card-sm text-dark-text-primary mb-1">Review history</span>
<p className="font-body-sm text-body-sm text-dark-text-secondary">Auditable log stored directly on GitHub PRs.</p>
</div>
</div>
</section>

<section className="w-full py-28 px-6 lg:px-12 bg-dark-surface/40 border-y border-dark-border relative z-10 backdrop-blur-sm" id="security-vault">
<div className="max-w-[1280px] mx-auto">
<div className="mb-16 max-w-2xl">
<div className="font-badge-mono text-badge-mono uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span> Zero Data Retention Vault
      </div>
<h2 className="font-headline-section text-headline-section text-dark-text-primary tracking-tight mb-4">
        Your code stays yours.
      </h2>
<p className="font-body-base text-body-base text-dark-text-secondary">
        Kareixo is designed around privacy. Code diffs are used to generate reviews in volatile memory and are purged immediately after execution.
      </p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
<div className="scroll-tilt-card p-6 rounded-2xl stage-blur-card border border-white/10 hover:border-emerald-500/40 transition-colors">
<div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
<span className="material-symbols-outlined text-[24px]">memory</span>
</div>
<h3 className="font-title-card-sm text-title-card-sm text-dark-text-primary mb-2">No code storage</h3>
<p className="font-body-sm text-body-sm text-dark-text-secondary leading-relaxed">
          Payloads are processed in ephemeral RAM workers and immediately discarded after review posting.
        </p>
</div>
<div className="scroll-tilt-card p-6 rounded-2xl stage-blur-card border border-white/10 hover:border-emerald-500/40 transition-colors">
<div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
<span className="material-symbols-outlined text-[24px]">key</span>
</div>
<h3 className="font-title-card-sm text-title-card-sm text-dark-text-primary mb-2">GitHub-native permissions</h3>
<p className="font-body-sm text-body-sm text-dark-text-secondary leading-relaxed">
          Strict read/write separation via GitHub App authorization tokens with scoped repo limits.
        </p>
</div>
<div className="scroll-tilt-card p-6 rounded-2xl stage-blur-card border border-white/10 hover:border-emerald-500/40 transition-colors">
<div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
<span className="material-symbols-outlined text-[24px]">sync_alt</span>
</div>
<h3 className="font-title-card-sm text-title-card-sm text-dark-text-primary mb-2">Secure webhook flow</h3>
<p className="font-body-sm text-body-sm text-dark-text-secondary leading-relaxed">
          HMAC-SHA256 signature verification guarantees payloads originate directly from GitHub.
        </p>
</div>
<div className="scroll-tilt-card p-6 rounded-2xl stage-blur-card border border-white/10 hover:border-emerald-500/40 transition-colors">
<div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
<span className="material-symbols-outlined text-[24px]">visibility</span>
</div>
<h3 className="font-title-card-sm text-title-card-sm text-dark-text-primary mb-2">Transparent review process</h3>
<p className="font-body-sm text-body-sm text-dark-text-secondary leading-relaxed">
          Complete audit trail lives entirely in your GitHub PR timeline, fully accessible to your team.
        </p>
</div>
</div>
</div>
</section>

<section className="w-full py-28 px-6 lg:px-12 max-w-[1280px] mx-auto perspective-cinema">
<div className="p-10 lg:p-16 rounded-3xl stage-blur-card border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
<div className="max-w-xl">
<div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 mb-4">
<span className="font-badge-mono text-badge-mono text-emerald-400 uppercase">Accessible To All Developers</span>
</div>
<h2 className="font-headline-section text-headline-section text-dark-text-primary tracking-tight mb-4">
        Powerful reviews. No pricing wall.
      </h2>
<p className="font-body-base text-body-base text-dark-text-secondary mb-0 leading-relaxed">
        Kareixo is built to stay accessible to developers. Reviews are routed across available AI capacity with automatic failover, keeping it completely free without paywalled review limits.
      </p>
</div>
<div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
<div className="p-8 rounded-2xl bg-black/60 border border-secondary/30 text-center w-full sm:w-auto min-w-[240px] shadow-xl">
<div className="font-badge-mono text-badge-mono text-dark-text-muted mb-1">Developer Plan</div>
<div className="font-headline-section text-headline-section text-white font-bold">$0</div>
<span className="font-body-sm text-body-sm text-emerald-400">Unlimited Public &amp; Private PRs</span>
</div>
</div>
</div>
</section>

<section className="w-full py-28 px-6 lg:px-12 bg-dark-surface/40 border-y border-dark-border relative z-10 backdrop-blur-sm" id="kareixo-chat">
<div className="max-w-[1280px] mx-auto">
<div className="mb-14 max-w-2xl">
<div className="font-badge-mono text-badge-mono uppercase tracking-widest text-secondary mb-2">Interactive Assistance</div>
<h2 className="font-headline-section text-headline-section text-dark-text-primary tracking-tight mb-4">
        And when you&apos;re not reviewing a PR, just ask Kareixo.
      </h2>
<p className="font-body-base text-body-base text-dark-text-secondary">
        Use Kareixo Chat as a general-purpose AI assistant for development, debugging, and technical questions.
      </p>
</div>

<div className="max-w-3xl mx-auto rounded-2xl stage-blur-card border border-white/10 shadow-2xl overflow-hidden">
<div className="px-5 py-3.5 bg-dark-surface/90 border-b border-dark-border flex items-center justify-between font-badge-mono text-badge-mono text-dark-text-muted">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-accent-ai-hover animate-pulse"></span>
<span className="text-dark-text-primary font-medium">Kareixo Chat Session</span>
</div>
<span>v2.4 active</span>
</div>
<div className="p-6 space-y-6 bg-black/40">

<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0 font-badge-mono text-badge-mono text-white">
            U
          </div>
<div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10 font-body-base text-body-base text-dark-text-primary">
            Why is this query slow?
          </div>
</div>

<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center shrink-0 shadow-lg shadow-secondary/30">
<span className="material-symbols-outlined text-[18px]">smart_toy</span>
</div>
<div className="flex-1 stage-blur-card p-5 rounded-xl border border-white/10 space-y-3 font-body-base text-body-base text-dark-text-primary">
<p>
              The query is performing an unnecessary full-table scan on <code className="font-code-diff text-code-diff bg-black/60 text-emerald-400 px-2 py-0.5 rounded border border-dark-border">users</code> because index <code className="font-code-diff text-code-diff bg-black/60 text-emerald-400 px-2 py-0.5 rounded border border-dark-border">idx_users_email</code> is bypassed.
            </p>
<p className="text-dark-text-secondary text-body-sm font-body-sm">
              Because <code className="font-code-diff text-[12px] bg-black/60 px-1.5 py-0.5 rounded border border-dark-border">LOWER(email)</code> was called inside the WHERE filter without a corresponding functional index, PostgreSQL falls back to sequential inspection.
            </p>
<div className="p-3.5 bg-black/70 rounded-lg border border-dark-border font-code-diff text-code-diff text-secondary">
              CREATE INDEX idx_users_lower_email ON users (LOWER(email));
            </div>
</div>
</div>
</div>
<div className="p-4 bg-dark-surface border-t border-dark-border flex items-center justify-between">
<span className="font-body-sm text-body-sm text-dark-text-muted">Direct interactive workspace integration</span>
<a className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-secondary text-white font-label-ui text-label-ui shadow-lg shadow-secondary/20 hover:bg-accent-ai-hover transition-colors" data-path="kareixo-chat" href="#">
<span>Try Kareixo Chat</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
</div>
</section>

<section className="w-full py-36 px-6 lg:px-12 max-w-[1280px] mx-auto text-center perspective-cinema relative">
<div className="max-w-3xl mx-auto flex flex-col items-center">

<div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl stage-blur-card border border-secondary/30 font-badge-mono text-[13px] text-zinc-300 shadow-2xl">
<span className="text-secondary">$</span>
<span>npx kareixo-audit@latest --verify-repo</span>
<span className="w-2 h-4 bg-secondary animate-pulse ml-1"></span>
</div>
<h2 className="font-headline-section text-headline-section md:text-5xl text-dark-text-primary tracking-tight mb-4">
      Your next pull request could already be better.
    </h2>
<p className="font-body-base text-body-base md:text-lg text-dark-text-secondary mb-10 max-w-xl">
      Connect Kareixo to GitHub and let every pull request get an intelligent 3D inspection second pair of eyes.
    </p>
<div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
<a className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-xl bg-gradient-to-r from-secondary to-accent-ai-hover text-white font-semibold font-label-ui text-label-ui shadow-2xl shadow-secondary/40 hover:opacity-95 transition-all duration-200 hover:-translate-y-0.5" data-path="install" href="#">
<svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
<path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
</svg>
<span>Install on GitHub</span>
</a>
<a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl stage-blur-card text-dark-text-primary font-label-ui text-label-ui border border-white/10 shadow-lg hover:border-secondary transition-all duration-200 hover:-translate-y-0.5" href="https://github.com" rel="noreferrer" target="_blank">
<span className="material-symbols-outlined text-[18px]">terminal</span>
<span>View source on GitHub</span>
</a>
</div>
</div>
</section>
</div></main>

<footer className="w-full bg-[#070709] border-t border-dark-border py-space-16 relative z-10"><div className="max-w-[1280px] mx-auto px-6 lg:px-12"><div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 md:gap-x-12 pb-space-12"><div className="md:col-span-5 flex flex-col items-start"><div className="flex items-center gap-2 mb-3"><span className="font-title-card-sm text-title-card-sm text-dark-text-primary tracking-tight">Kareixo</span><span className="text-xs px-2 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/30 font-badge-mono">3D Interactive</span></div><p className="font-body-sm text-body-sm text-dark-text-secondary max-w-sm">AI code review platform for GitHub. Precision diagnostics, automated sanity checks, and automated pull request analysis.</p></div><div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8"><div><h4 className="font-label-ui text-label-ui text-dark-text-primary mb-4 font-semibold">Product</h4><ul className="space-y-3 font-body-sm text-body-sm text-dark-text-secondary"><li><a className="hover:text-white transition-colors" data-path="product" href="#stage-engine">Engine</a></li><li><a className="hover:text-white transition-colors" data-path="how-it-works" href="#how-it-works">Timeline</a></li><li><a className="hover:text-white transition-colors" data-path="security" href="#security-vault">Security Vault</a></li><li><a className="hover:text-white transition-colors" data-path="kareixo-chat" href="#kareixo-chat">Kareixo Chat</a></li></ul></div><div><h4 className="font-label-ui text-label-ui text-dark-text-primary mb-4 font-semibold">Resources</h4><ul className="space-y-3 font-body-sm text-body-sm text-dark-text-secondary"><li><a className="hover:text-white transition-colors" data-path="pricing" href="#">Pricing</a></li><li><a className="hover:text-white transition-colors" href="https://github.com" rel="noreferrer" target="_blank">GitHub</a></li><li><a className="hover:text-white transition-colors" data-path="privacy" href="#">Privacy</a></li><li><a className="hover:text-white transition-colors" data-path="terms" href="#">Terms</a></li></ul></div><div><h4 className="font-label-ui text-label-ui text-dark-text-primary mb-4 font-semibold">Developers</h4><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30"><span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span><span className="font-badge-mono text-badge-mono text-secondary">v2.4 Active · 3D</span></div></div></div></div><div className="pt-space-8 border-t border-dark-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-dark-text-muted"><p>© 2026 Kareixo. Free forever · Built for developers.</p><div className="flex items-center gap-6"><a className="hover:text-dark-text-secondary transition-colors" data-path="privacy" href="#">Privacy Policy</a><a className="hover:text-dark-text-secondary transition-colors" data-path="terms" href="#">Terms of Service</a></div></div></div></footer>



    </>
  );
}
