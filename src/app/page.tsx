import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas-default text-fg-default font-body-base selection:bg-accent-blue/30">
      <Navbar />
      
      <main className="w-full pt-32 pb-16 px-gutter max-w-[1280px] mx-auto flex flex-col gap-space-xl">
        {/* Hero Section */}
        <section className="flex flex-col items-start gap-space-md max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-border-default bg-surface-container text-fg-muted font-badge-mono text-badge-mono">
            <span className="w-2 h-2 rounded-full bg-accent-green-emphasis animate-pulse"></span>
            Kareixo AST Engine v2.4 Live
          </div>
          
          <h1 className="font-headline-hero text-headline-hero-mobile md:text-headline-hero text-fg-default tracking-tight">
            Ship better code.<br />
            <span className="text-fg-muted">Automatically in motion.</span>
          </h1>
          
          <p className="font-body-base text-body-base text-fg-muted max-w-2xl leading-relaxed">
            Kareixo reviews pull requests with deterministic static analysis, catching logic flaws and security leaks before production. Fluid, live-streamed code intelligence directly in your GitHub flow.
          </p>
          
          <div className="flex items-center gap-space-sm pt-space-sm">
            <a 
              href="https://github.com/apps/kareixo-reviewer/installations/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-accent-green-emphasis hover:bg-accent-green-hover text-white font-title-card-sm text-title-card-sm font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Install on GitHub
            </a>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-surface-container hover:bg-surface-container-high border border-border-default text-fg-default font-title-card-sm text-title-card-sm font-semibold transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </section>

        {/* Feature Grid / Terminal Mockup */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-xl border-t border-border-default">
          {/* Feature 1 */}
          <div className="flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-md bg-surface-container border border-border-default flex items-center justify-center text-accent-purple">
              <span className="material-symbols-outlined">merge</span>
            </div>
            <h3 className="font-title-card text-title-card text-fg-default font-semibold">Deterministic Static Analysis</h3>
            <p className="font-body-sm text-body-sm text-fg-muted leading-relaxed">
              Every pull request is analyzed by our AST engine. We find the bugs that regular linters miss, tracing logic paths across multiple files and enforcing architectural boundaries.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-md bg-surface-container border border-border-default flex items-center justify-center text-accent-blue">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <h3 className="font-title-card text-title-card text-fg-default font-semibold">CodeChat Intelligence</h3>
            <p className="font-body-sm text-body-sm text-fg-muted leading-relaxed">
              Ask questions about your codebase directly in the dashboard. Kareixo reads your repository files in real-time to answer architecture and implementation questions with context.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-md bg-surface-container border border-border-default flex items-center justify-center text-accent-red">
              <span className="material-symbols-outlined">radar</span>
            </div>
            <h3 className="font-title-card text-title-card text-fg-default font-semibold">Incident Tracer</h3>
            <p className="font-body-sm text-body-sm text-fg-muted leading-relaxed">
              Paste a production stack trace and watch the AST Blame Engine trace each frame back to the exact commit and pull request that introduced the bug.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-md bg-surface-container border border-border-default flex items-center justify-center text-accent-green-emphasis">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <h3 className="font-title-card text-title-card text-fg-default font-semibold">Zero Configuration</h3>
            <p className="font-body-sm text-body-sm text-fg-muted leading-relaxed">
              No complex yaml files to write. Install the GitHub app, select your repositories, and Kareixo starts reviewing your code immediately.
            </p>
          </div>
        </section>

        {/* Code Diff Example */}
        <section className="w-full rounded-md border border-border-default bg-canvas-inset overflow-hidden mt-space-lg">
          <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container border-b border-border-default">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[16px] text-fg-muted">code</span>
              <span className="font-body-base text-body-base text-fg-default font-medium">src/auth.ts</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-surface-container-high text-fg-muted border border-border-default">
                1 vulnerability found
              </span>
            </div>
          </div>
          <div className="flex flex-col font-code-diff text-code-diff">
            <div className="flex items-center bg-diff-deletion-line text-diff-deletion-text px-space-sm py-1">
              <span className="w-10 text-right pr-4 select-none opacity-50 font-code-gutter">42</span>
              <span className="w-6 text-center select-none">-</span>
              <span>const safe = crypto.timingSafeEqual(a, b);</span>
            </div>
            <div className="flex items-center bg-diff-addition-line text-diff-addition-text px-space-sm py-1">
              <span className="w-10 text-right pr-4 select-none opacity-50 font-code-gutter">43</span>
              <span className="w-6 text-center select-none">+</span>
              <span>const safe = crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));</span>
            </div>
            <div className="flex items-start gap-3 mt-4 mb-4 mx-4 p-space-sm rounded-md border border-border-default bg-surface-container-low">
              <span className="material-symbols-outlined text-accent-amber text-[18px] mt-0.5">warning</span>
              <div className="flex flex-col gap-1">
                <span className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">Timing Attack Vulnerability</span>
                <span className="font-body-sm text-body-sm text-fg-muted">
                  String arguments to timingSafeEqual are deprecated and susceptible to timing attacks if the encoding length varies. Use Buffers instead.
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-border-default bg-surface-container mt-auto">
        <div className="max-w-[1280px] mx-auto px-gutter py-space-xl flex flex-col md:flex-row justify-between gap-space-lg">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center gap-2 font-semibold text-fg-default text-lg">
              <img src="/logo.png" alt="Kareixo Logo" className="w-6 h-6 rounded-md object-contain" />
              Kareixo
            </div>
            <p className="font-body-sm text-body-sm text-fg-muted max-w-xs">
              AI code review platform for GitHub. Precision diagnostics and automated pull request analysis.
            </p>
          </div>
          
          <div className="flex gap-space-xl">
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-ui text-label-ui text-fg-default font-semibold uppercase tracking-wider">Product</span>
              <Link href="/dashboard" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">Dashboard</Link>
              <Link href="/codechat" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">CodeChat</Link>
              <Link href="/incident" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">Incident Tracer</Link>
            </div>
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-ui text-label-ui text-fg-default font-semibold uppercase tracking-wider">Legal</span>
              <Link href="/privacy" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="font-body-sm text-body-sm text-fg-muted hover:text-fg-default transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
