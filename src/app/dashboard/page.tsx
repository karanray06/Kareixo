export default function DashboardOverview() {
  return (
    <>
      <div className="flex flex-col w-full">
<div className="max-w-[1280px] w-full mx-auto px-space-6 py-space-8 flex flex-col gap-space-8">

<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-4 pb-space-4 border-b border-border">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2 font-badge-mono text-badge-mono text-text-secondary">
<span className="w-2 h-2 rounded-full bg-success"></span>
<span>SYSTEM DISPATCHER ACTIVE</span>
<span className="text-text-muted">/</span>
<span>12 REPOSITORIES MONITORED</span>
</div>
<h1 className="font-headline-section text-headline-section text-text-primary tracking-tight">Good evening, Karan.</h1>
<p className="font-body-base text-body-base text-text-secondary">Here&apos;s what&apos;s happening across your 12 connected repositories.</p>
</div>
<div className="flex items-center flex-wrap gap-space-3">

<div className="relative">
<button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-text-primary font-label-ui text-label-ui hover:bg-surface-subtle transition-colors shadow-sm" id="range-dropdown-btn">
<span className="material-symbols-outlined text-[16px] text-text-secondary">calendar_today</span>
<span>Last 7 days</span>
<span className="material-symbols-outlined text-[16px] text-text-muted">expand_more</span>
</button>
</div>

<button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface border border-border hover:border-border-strong text-text-primary font-label-ui text-label-ui shadow-sm transition-all hover:bg-surface-subtle active:scale-95" id="sync-btn">
<span className="material-symbols-outlined text-[16px] text-text-secondary" id="sync-icon">sync</span>
<span>Sync Repositories</span>
</button>

<button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui shadow-sm hover:opacity-90 active:scale-95 transition-all">
<span className="material-symbols-outlined text-[18px]">add</span>
<span>Add Repository</span>
</button>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-4">

<div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col justify-between hover:border-border-strong transition-all shadow-sm">
<div className="flex items-center justify-between text-text-secondary">
<span className="font-label-ui text-label-ui uppercase tracking-wider text-[11px] font-semibold">Total Reviews</span>
<span className="material-symbols-outlined text-[18px] text-text-muted">rate_review</span>
</div>
<div className="my-space-3 flex items-baseline justify-between">
<span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">48</span>
<div className="flex items-center gap-1 font-badge-mono text-badge-mono text-success bg-success-subtle px-2 py-0.5 rounded-full border border-success/20">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span>
<span>+14%</span>
</div>
</div>
<div className="flex items-center justify-between text-text-muted font-badge-mono text-[11px] pt-2 border-t border-border/60">
<span>7-day cadence</span>
<span className="text-text-secondary font-medium">6.8 / day avg</span>
</div>
</div>

<div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col justify-between hover:border-border-strong transition-all shadow-sm">
<div className="flex items-center justify-between text-text-secondary">
<span className="font-label-ui text-label-ui uppercase tracking-wider text-[11px] font-semibold">Passed Clean</span>
<span className="w-2.5 h-2.5 rounded-full bg-success"></span>
</div>
<div className="my-space-3 flex items-baseline justify-between">
<span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">36</span>
<span className="font-badge-mono text-badge-mono text-text-secondary">75.0% pass rate</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
<div className="bg-success h-full rounded-full transition-all duration-500" style={{ width: "75%" }}></div>
</div>
</div>

<div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col justify-between hover:border-border-strong transition-all shadow-sm">
<div className="flex items-center justify-between text-text-secondary">
<span className="font-label-ui text-label-ui uppercase tracking-wider text-[11px] font-semibold">Active Findings</span>
<span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse"></span>
</div>
<div className="my-space-3 flex items-baseline justify-between">
<span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">9</span>
<div className="flex items-center gap-1.5 font-badge-mono text-[11px] text-text-secondary">
<span className="text-error font-medium">3 sec</span>
<span>·</span>
<span className="text-warning font-medium">4 perf</span>
<span>·</span>
<span className="text-text-muted font-medium">2 qual</span>
</div>
</div>
<div className="flex items-center justify-between text-text-muted font-badge-mono text-[11px] pt-2 border-t border-border/60">
<span>Across 4 open PRs</span>
<span className="text-warning font-medium">1 blocker</span>
</div>
</div>

<div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col justify-between hover:border-border-strong transition-all shadow-sm">
<div className="flex items-center justify-between text-text-secondary">
<span className="font-label-ui text-label-ui uppercase tracking-wider text-[11px] font-semibold">Avg Review Time</span>
<span className="material-symbols-outlined text-[18px] text-secondary">bolt</span>
</div>
<div className="my-space-3 flex items-baseline justify-between">
<span className="font-headline-section text-[32px] leading-tight text-text-primary font-semibold">18<span className="font-body-base text-base font-normal text-text-secondary">s</span></span>
<span className="font-badge-mono text-badge-mono text-text-muted">webhook ~210ms</span>
</div>
<div className="flex items-center justify-between text-text-muted font-badge-mono text-[11px] pt-2 border-t border-border/60">
<span className="flex items-center gap-1 text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            Zero-queue pipeline
          </span>
<span>P99 &lt; 28s</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-8 items-start">

<div className="lg:col-span-8 flex flex-col gap-space-4">

<div className="flex items-center justify-between bg-surface px-space-4 py-space-3 rounded-xl border border-border shadow-sm">
<div className="flex items-center gap-space-3">
<h2 className="font-title-card-sm text-title-card-sm text-text-primary">Recent Automated Reviews</h2>
<div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-ai-subtle border border-outline-variant/40 font-badge-mono text-[11px] text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
<span>Connected to GitHub Events</span>
</div>
</div>
<div className="flex items-center gap-2">
<div className="flex items-center bg-surface-subtle p-0.5 rounded-lg border border-border">
<button className="px-2.5 py-1 rounded-md bg-surface text-text-primary font-label-ui text-[12px] font-semibold shadow-xs">All</button>
<button className="px-2.5 py-1 rounded-md text-text-secondary hover:text-text-primary font-label-ui text-[12px] transition-colors">Needs Attention</button>
<button className="px-2.5 py-1 rounded-md text-text-secondary hover:text-text-primary font-label-ui text-[12px] transition-colors">Passed</button>
</div>
</div>
</div>

<div className="flex flex-col gap-space-3">

<div className="group bg-surface rounded-xl border border-border p-space-4 hover:border-border-strong hover:shadow-md transition-all flex flex-col gap-space-3">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div className="flex items-center gap-2.5 flex-wrap">
<span className="font-badge-mono text-badge-mono font-semibold px-2 py-0.5 rounded bg-surface-subtle text-text-primary border border-border">api-service</span>
<span className="font-badge-mono text-badge-mono text-text-secondary font-medium">#284</span>
<span className="font-title-card-sm text-title-card-sm text-text-primary hover:text-secondary cursor-pointer transition-colors">Add authentication middleware</span>
</div>
<span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-warning-subtle text-warning border border-warning/30">
<span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                Needs attention
              </span>
</div>

<div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-body-sm text-text-secondary">
<div className="flex items-center gap-space-3 flex-wrap font-badge-mono text-[12px]">
<div className="flex items-center gap-1.5">
<div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-bold text-[10px] text-text-primary border border-border">A</div>
<span className="text-text-primary">@alexdev</span>
</div>
<span className="text-text-muted">·</span>
<span className="flex items-center gap-1 text-text-secondary">
<span className="material-symbols-outlined text-[14px]">schedule</span>
                  3m ago
                </span>
<span className="text-text-muted">·</span>
<div className="flex items-center gap-2">
<span className="px-1.5 py-0.5 rounded bg-error-subtle text-error font-medium text-[11px]">2 Security</span>
<span className="px-1.5 py-0.5 rounded bg-warning-subtle text-warning font-medium text-[11px]">1 Perf</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-text-secondary font-medium text-[11px]">1 Style</span>
</div>
</div>
<div className="flex items-center gap-2 ml-auto">
<a className="p-1.5 rounded hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors" href="#" title="Open in GitHub">
<span className="material-symbols-outlined text-[18px]">open_in_new</span>
</a>
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-ui text-label-ui border border-border transition-colors">
<span>View Findings</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="group bg-surface rounded-xl border border-border p-space-4 hover:border-border-strong hover:shadow-md transition-all flex flex-col gap-space-3">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div className="flex items-center gap-2.5 flex-wrap">
<span className="font-badge-mono text-badge-mono font-semibold px-2 py-0.5 rounded bg-surface-subtle text-text-primary border border-border">web-client</span>
<span className="font-badge-mono text-badge-mono text-text-secondary font-medium">#4109</span>
<span className="font-title-card-sm text-title-card-sm text-text-primary hover:text-secondary cursor-pointer transition-colors">Fix checkout state race condition</span>
</div>
<span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-success-subtle text-success border border-success/30">
<span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                Passed clean
              </span>
</div>
<div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-body-sm text-text-secondary">
<div className="flex items-center gap-space-3 flex-wrap font-badge-mono text-[12px]">
<div className="flex items-center gap-1.5">
<div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-bold text-[10px] text-text-primary border border-border">S</div>
<span className="text-text-primary">@sarah-m</span>
</div>
<span className="text-text-muted">·</span>
<span className="flex items-center gap-1 text-text-secondary">
<span className="material-symbols-outlined text-[14px]">schedule</span>
                  18m ago
                </span>
<span className="text-text-muted">·</span>
<span className="text-text-muted">0 findings flagged</span>
</div>
<div className="flex items-center gap-2 ml-auto">
<a className="p-1.5 rounded hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors" href="#" title="Open in GitHub">
<span className="material-symbols-outlined text-[18px]">open_in_new</span>
</a>
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-ui text-label-ui border border-border transition-colors">
<span>View Review</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="group bg-surface rounded-xl border border-border p-space-4 hover:border-border-strong hover:shadow-md transition-all flex flex-col gap-space-3">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div className="flex items-center gap-2.5 flex-wrap">
<span className="font-badge-mono text-badge-mono font-semibold px-2 py-0.5 rounded bg-surface-subtle text-text-primary border border-border">analytics-worker</span>
<span className="font-badge-mono text-badge-mono text-text-secondary font-medium">#845</span>
<span className="font-title-card-sm text-title-card-sm text-text-primary hover:text-secondary cursor-pointer transition-colors">Batch event ingestion queue</span>
</div>
<span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-accent-ai-subtle text-secondary border border-secondary/30">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Passed with suggestions
              </span>
</div>
<div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-body-sm text-text-secondary">
<div className="flex items-center gap-space-3 flex-wrap font-badge-mono text-[12px]">
<div className="flex items-center gap-1.5">
<div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-bold text-[10px] text-text-primary border border-border">C</div>
<span className="text-text-primary">@chen-lei</span>
</div>
<span className="text-text-muted">·</span>
<span className="flex items-center gap-1 text-text-secondary">
<span className="material-symbols-outlined text-[14px]">schedule</span>
                  1h ago
                </span>
<span className="text-text-muted">·</span>
<span className="text-secondary font-medium">2 AI suggestions (Memory pool sizing)</span>
</div>
<div className="flex items-center gap-2 ml-auto">
<a className="p-1.5 rounded hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors" href="#" title="Open in GitHub">
<span className="material-symbols-outlined text-[18px]">open_in_new</span>
</a>
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-ui text-label-ui border border-border transition-colors">
<span>View Review</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="group bg-surface rounded-xl border border-error/40 p-space-4 hover:border-error hover:shadow-md transition-all flex flex-col gap-space-3 relative overflow-hidden">
<div className="absolute top-0 left-0 bottom-0 w-1 bg-error"></div>
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-2">
<div className="flex items-center gap-2.5 flex-wrap">
<span className="font-badge-mono text-badge-mono font-semibold px-2 py-0.5 rounded bg-surface-subtle text-text-primary border border-border">infra-terraform</span>
<span className="font-badge-mono text-badge-mono text-text-secondary font-medium">#112</span>
<span className="font-title-card-sm text-title-card-sm text-text-primary hover:text-error cursor-pointer transition-colors">Update ingress CIDR blocks &amp; TLS</span>
</div>
<span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-error-subtle text-error border border-error/30">
<span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                Critical issue
              </span>
</div>
<div className="pl-2">
<div className="p-2.5 rounded-lg bg-error-subtle/50 border border-error/20 flex items-start gap-2.5">
<span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">security_update_warning</span>
<p className="font-badge-mono text-[12px] text-error leading-relaxed">
                  Security blocker: Unrestricted 0.0.0.0/0 ingress declared on administrative port 22 in `modules/vpc/security_groups.tf:44`.
                </p>
</div>
</div>
<div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-body-sm text-text-secondary pl-2">
<div className="flex items-center gap-space-3 flex-wrap font-badge-mono text-[12px]">
<div className="flex items-center gap-1.5">
<div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-bold text-[10px] text-text-primary border border-border">D</div>
<span className="text-text-primary">@devops-bot</span>
</div>
<span className="text-text-muted">·</span>
<span className="flex items-center gap-1 text-text-secondary">
<span className="material-symbols-outlined text-[14px]">schedule</span>
                  3h ago
                </span>
<span className="text-text-muted">·</span>
<span className="text-error font-medium">1 high severity issue</span>
</div>
<div className="flex items-center gap-2 ml-auto">
<a className="p-1.5 rounded hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors" href="#" title="Open in GitHub">
<span className="material-symbols-outlined text-[18px]">open_in_new</span>
</a>
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error text-on-error font-label-ui text-label-ui hover:bg-error/90 transition-colors shadow-xs">
<span>View Findings</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="group bg-surface rounded-xl border border-border p-space-4 hover:border-border-strong hover:shadow-md transition-all flex flex-col gap-space-3">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div className="flex items-center gap-2.5 flex-wrap">
<span className="font-badge-mono text-badge-mono font-semibold px-2 py-0.5 rounded bg-surface-subtle text-text-primary border border-border">kareixo-core</span>
<span className="font-badge-mono text-badge-mono text-text-secondary font-medium">#92</span>
<span className="font-title-card-sm text-title-card-sm text-text-primary hover:text-secondary cursor-pointer transition-colors">Optimize AST parser token stream caching</span>
</div>
<span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-mono text-[11px] font-medium bg-success-subtle text-success border border-success/30">
<span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                Passed clean
              </span>
</div>
<div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-body-sm text-text-secondary">
<div className="flex items-center gap-space-3 flex-wrap font-badge-mono text-[12px]">
<div className="flex items-center gap-1.5">
<div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[10px]">K</div>
<span className="text-text-primary">@karanray06</span>
</div>
<span className="text-text-muted">·</span>
<span className="flex items-center gap-1 text-text-secondary">
<span className="material-symbols-outlined text-[14px]">schedule</span>
                  5h ago
                </span>
<span className="text-text-muted">·</span>
<span className="text-text-muted">0 findings flagged (4 files changed)</span>
</div>
<div className="flex items-center gap-2 ml-auto">
<a className="p-1.5 rounded hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors" href="#" title="Open in GitHub">
<span className="material-symbols-outlined text-[18px]">open_in_new</span>
</a>
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-ui text-label-ui border border-border transition-colors">
<span>View Review</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>

<div className="flex items-center justify-between px-space-2 py-2 text-text-secondary font-badge-mono text-[12px]">
<span>Showing 5 of 48 total reviews</span>
<button className="hover:text-text-primary underline underline-offset-4 transition-colors">Load more reviews...</button>
</div>
</div>

<div className="lg:col-span-4 flex flex-col gap-space-4">

<div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col gap-space-4 shadow-sm">
<div className="flex items-center justify-between border-b border-border pb-space-3">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-text-secondary">lan</span>
<h3 className="font-title-card-sm text-title-card-sm text-text-primary">Repository Health</h3>
</div>
<span className="font-badge-mono text-[11px] text-text-muted">Real-time</span>
</div>
<div className="flex flex-col gap-space-3">

<div className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center justify-between">
<span className="font-badge-mono text-badge-mono font-medium text-text-primary truncate">karanray06/api-service</span>
<span className="font-badge-mono text-[11px] text-text-secondary font-semibold">99.2%</span>
</div>
<div className="flex items-center justify-between text-[11px] font-badge-mono text-text-muted">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">fork_right</span>
                  main
                </span>
<span>3m ago</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1 overflow-hidden">
<div className="bg-success h-full rounded-full" style="width: 99.2%"></div>
</div>
</div>

<div className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center justify-between">
<span className="font-badge-mono text-badge-mono font-medium text-text-primary truncate">karanray06/web-client</span>
<span className="font-badge-mono text-[11px] text-success font-semibold">100%</span>
</div>
<div className="flex items-center justify-between text-[11px] font-badge-mono text-text-muted">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">fork_right</span>
                  main
                </span>
<span>18m ago</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1 overflow-hidden">
<div className="bg-success h-full rounded-full" style={{ width: "100%" }}></div>
</div>
</div>

<div className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center justify-between">
<span className="font-badge-mono text-badge-mono font-medium text-text-primary truncate">karanray06/analytics-worker</span>
<span className="font-badge-mono text-[11px] text-text-secondary font-semibold">97.4%</span>
</div>
<div className="flex items-center justify-between text-[11px] font-badge-mono text-text-muted">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">fork_right</span>
                  main
                </span>
<span>1h ago</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1 overflow-hidden">
<div className="bg-warning h-full rounded-full" style="width: 97.4%"></div>
</div>
</div>

<div className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-surface-subtle transition-colors">
<div className="flex items-center justify-between">
<span className="font-badge-mono text-badge-mono font-medium text-text-primary truncate">karanray06/kareixo-core</span>
<span className="font-badge-mono text-[11px] text-success font-semibold">100%</span>
</div>
<div className="flex items-center justify-between text-[11px] font-badge-mono text-text-muted">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">fork_right</span>
                  main
                </span>
<span>5h ago</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1 overflow-hidden">
<div className="bg-success h-full rounded-full" style={{ width: "100%" }}></div>
</div>
</div>
</div>
<a className="pt-space-2 text-center font-label-ui text-label-ui text-text-secondary hover:text-text-primary border-t border-border flex items-center justify-center gap-1.5 transition-colors" href="#">
<span>View all 12 repositories</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</a>
</div>

<div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col gap-space-4 shadow-sm">
<div className="flex items-center justify-between border-b border-border pb-space-3">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-text-secondary">shield</span>
<h3 className="font-title-card-sm text-title-card-sm text-text-primary">Findings Breakdown</h3>
</div>
<span className="px-1.5 py-0.5 rounded font-badge-mono text-[10px] bg-surface-subtle text-text-secondary border border-border">9 Total</span>
</div>
<div className="flex flex-col gap-3">

<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-[12px] font-badge-mono">
<span className="text-text-primary flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-error"></span>
                  Security Vulnerabilities
                </span>
<span className="font-semibold text-error">3 <span className="text-[10px] font-normal text-text-muted">(1 High, 2 Med)</span></span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
<div className="bg-error h-full rounded-full" style="width: 33.3%"></div>
</div>
</div>

<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-[12px] font-badge-mono">
<span className="text-text-primary flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-warning"></span>
                  Logic &amp; Edge Cases
                </span>
<span className="font-semibold text-text-primary">4</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
<div className="bg-warning h-full rounded-full" style="width: 44.4%"></div>
</div>
</div>

<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-[12px] font-badge-mono">
<span className="text-text-primary flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-info"></span>
                  Performance Inefficiencies
                </span>
<span className="font-semibold text-text-primary">2</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
<div className="bg-info h-full rounded-full" style="width: 22.2%"></div>
</div>
</div>
</div>
<div className="pt-2 border-t border-border flex items-center justify-between">
<span className="font-badge-mono text-[11px] text-text-muted">Export options</span>
<div className="flex items-center gap-2">
<button className="px-2 py-1 rounded bg-surface-subtle hover:bg-surface-container border border-border font-badge-mono text-[11px] text-text-secondary transition-colors">JSON</button>
<button className="px-2 py-1 rounded bg-surface-subtle hover:bg-surface-container border border-border font-badge-mono text-[11px] text-text-secondary transition-colors">CSV</button>
</div>
</div>
</div>

<div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col gap-space-3 shadow-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">memory</span>
<h3 className="font-title-card-sm text-title-card-sm text-text-primary">Engine &amp; Routing</h3>
</div>
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-badge-mono text-[10px] font-medium bg-success-subtle text-success border border-success/30">
<span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              Operational
            </span>
</div>
<div className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-2 font-badge-mono text-[12px]">
<div className="flex items-center justify-between">
<span className="text-text-muted">Primary Route</span>
<span className="text-text-primary font-medium flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Gemini Pro
              </span>
</div>
<div className="flex items-center justify-between">
<span className="text-text-muted">Secondary Route</span>
<span className="text-text-secondary">Claude 3.5 Sonnet (Standby)</span>
</div>
<div className="flex items-center justify-between">
<span className="text-text-muted">Cluster Region</span>
<span className="text-text-primary">us-east (Virginia)</span>
</div>
<div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px]">
<span className="text-text-muted">Data Retention</span>
<span className="text-success font-semibold">Zero code stored</span>
</div>
</div>
<div className="flex items-center justify-between text-text-muted font-badge-mono text-[11px]">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">lock</span>
              Strict ephemeral context
            </span>
<span>v1.4.2-rev</span>
</div>
</div>
</div>
</div>
</div>
</div>

    </>
  );
}
