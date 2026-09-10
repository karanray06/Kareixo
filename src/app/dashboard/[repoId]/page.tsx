"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";

export default function RepositoryDetails({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = use(params);
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/repositories/${repoId}`)
      .then(res => res.json())
      .then(json => setData(json));
  }, [repoId]);

  return (
    <>
      <div className="flex flex-col w-full">

<div className="w-full bg-surface-elevated border-b border-border py-6 shadow-sm">
<div className="max-w-[1280px] mx-auto px-6 lg:px-12 flex flex-col gap-5">

<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

<div className="flex flex-col gap-2">
<div className="flex flex-wrap items-center gap-2.5">
<span className="material-symbols-outlined text-text-secondary text-[22px]">folder_code</span>
<div className="flex items-center gap-1.5 font-title-card text-title-card text-text-primary tracking-tight">
<span className="text-text-secondary font-medium">{data?.repository?.fullName?.split('/')[0] || "owner"}</span>
<span className="text-text-muted">/</span>
<span className="font-semibold text-text-primary">{data?.repository?.fullName?.split('/')[1] || "repo"}</span>
</div>

<button className="relative p-1 rounded hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors inline-flex items-center justify-center" id="copy-btn">
<span className="material-symbols-outlined text-[17px]">content_copy</span>
<span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-text-primary text-on-primary text-[11px] font-badge-mono px-2 py-0.5 rounded opacity-0 pointer-events-none transition-opacity duration-150" id="copy-tooltip">Copied</span>
</button>

<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-badge-mono font-medium bg-surface-subtle text-text-secondary border border-border">Public</span>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-badge-mono bg-surface-subtle text-text-primary border border-border">
<span className="material-symbols-outlined text-[13px] text-text-secondary">account_tree</span>
              default: main
            </span>
</div>

<div className="flex items-center gap-2">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
</span>
<span className="font-label-ui text-[12px] text-text-secondary">Webhook Active · Push &amp; PR triggers</span>
<span className="text-border-strong text-xs">•</span>
<span className="font-badge-mono text-[11px] text-text-muted">ID: wh_98f411b0e</span>
</div>
</div>

<div className="flex flex-wrap items-center gap-2.5">
<a className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-surface-elevated border border-border-interactive font-label-ui text-label-ui text-text-primary hover:bg-surface-subtle hover:border-border-strong transition-all duration-150" href={`https://github.com/${data?.repository?.fullName || ""}`} rel="noreferrer" target="_blank">
<span>Open GitHub</span>
<span className="material-symbols-outlined text-[15px] text-text-secondary">open_in_new</span>
</a>
<button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-surface-elevated border border-border-interactive font-label-ui text-label-ui text-text-primary hover:bg-surface-subtle hover:border-border-strong transition-all duration-150">
<span className="material-symbols-outlined text-[16px] text-text-secondary">tune</span>
<span>Repository Settings</span>
</button>
<button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-text-primary text-on-primary font-label-ui text-label-ui hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-sm" id="rescan-btn">
<span className="material-symbols-outlined text-[16px]" id="spin-icon">sync</span>
<span>Manual Re-scan</span>
</button>
</div>
</div>

<div className="mt-1 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">

<div className="flex flex-col">
<span className="font-label-ui text-[11px] text-text-muted tracking-wide uppercase">Total PRs Reviewed</span>
<div className="flex items-baseline gap-2 mt-0.5">
<span className="font-title-card text-title-card font-semibold text-text-primary">{data?.stats?.totalReviews || 0}</span>
<span className="font-badge-mono text-[11px] text-success">98.4% uptime</span>
</div>
</div>

<div className="flex flex-col">
<span className="font-label-ui text-[11px] text-text-muted tracking-wide uppercase">Active Findings</span>
<div className="flex items-baseline gap-2 mt-0.5">
<span className="font-title-card text-title-card font-semibold text-warning">{data?.stats?.activeFindings || 0}</span>
<span className="font-badge-mono text-[11px] text-text-secondary">2 Sec · 1 Perf</span>
</div>
</div>

<div className="flex flex-col">
<span className="font-label-ui text-[11px] text-text-muted tracking-wide uppercase">Clean Pass Ratio</span>
<div className="flex items-baseline gap-2 mt-0.5">
<span className="font-title-card text-title-card font-semibold text-text-primary">{data?.stats?.totalReviews ? Math.round((data?.stats?.passedClean / data.stats.totalReviews) * 100) : 0}%</span>
<span className="font-badge-mono text-[11px] text-success">↑ 3.1%</span>
</div>
</div>

<div className="flex flex-col">
<span className="font-label-ui text-[11px] text-text-muted tracking-wide uppercase">Avg Turnaround</span>
<div className="flex items-baseline gap-2 mt-0.5">
<span className="font-title-card text-title-card font-semibold text-text-primary">16s</span>
<span className="font-badge-mono text-[11px] text-text-secondary">AST parallel</span>
</div>
</div>

<div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col justify-center">
<div className="flex items-center justify-between text-[11px] font-label-ui text-text-secondary mb-1">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-info"></span>TypeScript 78.4%</span>
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary"></span>Go 16.2%</span>
</div>
<div className="w-full h-1.5 rounded-full bg-surface-subtle overflow-hidden flex">
<div className="h-full bg-info" style={{ width: "78.4%" }}></div>
<div className="h-full bg-secondary" style={{ width: "16.2%" }}></div>
<div className="h-full bg-text-muted" style={{ width: "5.4%" }}></div>
</div>
<div className="text-[10px] font-badge-mono text-text-muted mt-1 text-right">5.4% Docker &amp; Shell</div>
</div>
</div>
</div>
</div>

<div className="w-full bg-surface-elevated/70 border-b border-border sticky top-16 z-40 backdrop-blur-md">
<div className="max-w-[1280px] mx-auto px-6 lg:px-12 flex items-center gap-8 overflow-x-auto no-scrollbar">
<button className="relative py-3.5 font-label-ui text-label-ui font-semibold text-text-primary border-b-2 border-text-primary whitespace-nowrap flex items-center gap-2">
<span>Pull Requests &amp; Reviews</span>
<span className="px-1.5 py-0.2 rounded-full text-[10px] font-badge-mono bg-surface-subtle text-text-secondary border border-border">Active: 3 · Closed: 121</span>
</button>
<button className="py-3.5 font-label-ui text-label-ui text-text-secondary hover:text-text-primary border-b-2 border-transparent transition-colors whitespace-nowrap flex items-center gap-2">
<span>Findings &amp; Vulnerabilities</span>
<span className="px-1.5 py-0.2 rounded-full text-[10px] font-badge-mono bg-warning-subtle text-warning border border-warning/20">3</span>
</button>
<button className="py-3.5 font-label-ui text-label-ui text-text-secondary hover:text-text-primary border-b-2 border-transparent transition-colors whitespace-nowrap">
        Branch Protection &amp; Rules
      </button>
<button className="py-3.5 font-label-ui text-label-ui text-text-secondary hover:text-text-primary border-b-2 border-transparent transition-colors whitespace-nowrap">
        Webhook Audit Log
      </button>
</div>
</div>

<div className="w-full py-8">
<div className="max-w-[1280px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">

<div className="lg:col-span-8 flex flex-col gap-8">

<div className="flex flex-col gap-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[20px] text-text-primary">merge_type</span>
<h2 className="font-title-card-sm text-title-card-sm text-text-primary">Active Pull Requests</h2>
<span className="ml-1 text-[11px] font-badge-mono px-2 py-0.5 rounded-full bg-accent-ai-subtle text-accent-ai-hover font-semibold">3 in pipeline</span>
</div>
<div className="flex items-center gap-2 text-[12px] font-label-ui text-text-muted">
<span>Auto-refresh enabled</span>
<span className="inline-block w-1.5 h-1.5 rounded-full bg-success"></span>
</div>
</div>

<div className="bg-surface-elevated border border-border hover:border-border-strong rounded-xl p-5 shadow-sm transition-all duration-150">
<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center font-badge-mono text-xs font-semibold text-text-primary mt-0.5 border border-border">
                  AD
                </div>
<div>
<div className="flex flex-wrap items-center gap-2">
<span className="font-title-card-sm text-title-card-sm text-text-primary font-medium hover:underline cursor-pointer">
                      Add authentication middleware
                    </span>
<span className="font-badge-mono text-[12px] text-text-muted">#284</span>
</div>
<div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] font-body-sm text-text-secondary">
<span>by <span className="font-medium text-text-primary">@alexdev</span></span>
<span>·</span>
<span>Updated 3m ago</span>
<span>·</span>
<span className="font-badge-mono text-[11px] text-text-muted">commit <code className="bg-surface-subtle px-1 py-0.5 rounded text-text-primary">7f9c2d1</code></span>
</div>
</div>
</div>

<span className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-badge-mono font-medium bg-warning-subtle text-warning border border-warning/30">
<span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                Needs attention
              </span>
</div>

<div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-badge-mono bg-error-subtle text-error border border-error/20">
<span className="material-symbols-outlined text-[12px]">security</span>
                2 Security (High)
              </span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-badge-mono bg-warning-subtle text-warning border border-warning/20">
<span className="material-symbols-outlined text-[12px]">speed</span>
                1 Perf
              </span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-badge-mono bg-surface-subtle text-text-secondary border border-border">
<span className="material-symbols-outlined text-[12px]">code</span>
                1 Style
              </span>
</div>

<div className="mt-3.5 bg-surface-subtle rounded-lg border border-border overflow-hidden text-left">
<div className="px-3 py-1.5 bg-surface-container-high/60 border-b border-border flex items-center justify-between font-badge-mono text-[11px] text-text-secondary">
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[13px] text-error">warning</span>
                  src/middleware/auth.guard.ts:42
                </span>
<span className="text-error font-medium">Potential timing attack in token comparator</span>
</div>
<div className="p-3 font-code-diff text-code-diff bg-dark-background text-dark-text-primary font-mono text-[12px] leading-relaxed overflow-x-auto">
<div className="text-dark-text-muted">// Insecure direct string comparison flagged by Gemini AST</div>
<div className="text-error bg-error/15 px-2 py-0.5 rounded-sm">- if (reqToken === storedToken.secret) return next();</div>
<div className="text-success bg-success/15 px-2 py-0.5 rounded-sm">+ if (crypto.timingSafeEqual(Buffer.from(reqToken), Buffer.from(storedToken.secret))) return next();</div>
</div>
</div>

<div className="flex items-center justify-between mt-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-accent-ai-hover text-[17px]">auto_awesome</span>
<span className="font-body-sm text-[12px] text-text-secondary">Kareixo inline review posted directly to pull request diff</span>
</div>
<button className="inline-flex items-center gap-1 font-label-ui text-label-ui font-semibold text-text-primary hover:text-accent-ai-hover transition-colors">
<span>View Full Review</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>

<div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-full bg-accent-ai-subtle flex items-center justify-center font-badge-mono text-xs font-semibold text-accent-ai-hover mt-0.5 border border-accent-ai-hover/20">
                  KR
                </div>
<div>
<div className="flex flex-wrap items-center gap-2">
<span className="font-title-card-sm text-title-card-sm text-text-primary font-medium hover:underline cursor-pointer">
                      Migrate session tokens to Redis cluster
                    </span>
<span className="font-badge-mono text-[12px] text-text-muted">#291</span>
</div>
<div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] font-body-sm text-text-secondary">
<span>by <span className="font-medium text-text-primary">@karanray06</span></span>
<span>·</span>
<span>Updated 42m ago</span>
<span>·</span>
<span className="font-badge-mono text-[11px] text-text-muted">commit <code className="bg-surface-subtle px-1 py-0.5 rounded text-text-primary">a4b0811</code></span>
</div>
</div>
</div>

<span className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-badge-mono font-medium bg-info-subtle text-info border border-info/20">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-info"></span>
</span>
                Reviewing
              </span>
</div>

<div className="mt-4 p-3 bg-surface-subtle rounded-lg border border-border flex flex-col gap-2">
<div className="flex items-center justify-between text-[12px] font-label-ui">
<div className="flex items-center gap-2 text-text-primary">
<span className="material-symbols-outlined text-[16px] text-info animate-spin">sync</span>
<span>Analyzing AST token tree (2/4 files completed)...</span>
</div>
<span className="font-badge-mono text-text-muted">54%</span>
</div>
<div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
<div className="bg-info h-1.5 rounded-full transition-all duration-300" style={{ width: "54%" }}></div>
</div>
<div className="flex items-center justify-between text-[11px] font-badge-mono text-text-muted mt-0.5">
<span>Engines: Gemini 1.5 Pro · AST Worker node-03</span>
<span>Est: ~6s remaining</span>
</div>
</div>
</div>

<div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center font-badge-mono text-xs font-semibold text-text-primary mt-0.5 border border-border">
                  SM
                </div>
<div>
<div className="flex flex-wrap items-center gap-2">
<span className="font-title-card-sm text-title-card-sm text-text-primary font-medium hover:underline cursor-pointer">
                      Refactor CORS whitelist parsing
                    </span>
<span className="font-badge-mono text-[12px] text-text-muted">#279</span>
</div>
<div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] font-body-sm text-text-secondary">
<span>by <span className="font-medium text-text-primary">@sarah-m</span></span>
<span>·</span>
<span>Updated 3h ago</span>
<span>·</span>
<span className="font-badge-mono text-[11px] text-text-muted">commit <code className="bg-surface-subtle px-1 py-0.5 rounded text-text-primary">e129dd0</code></span>
</div>
</div>
</div>

<span className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-badge-mono font-medium bg-success-subtle text-success border border-success/30">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
                Passed clean
              </span>
</div>
<div className="mt-3 flex items-center justify-between text-[12px] font-label-ui pt-3 border-t border-border">
<span className="text-text-secondary flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-success">verified</span>
                0 findings flagged · All security checks and AST sanity audits passed
              </span>
<button className="font-label-ui text-text-secondary hover:text-text-primary text-[12px] font-medium transition-colors">
                Audit Summary →
              </button>
</div>
</div>
</div>

<div className="flex flex-col gap-3 pt-2">
<div className="flex items-center justify-between">
<h3 className="font-title-card-sm text-title-card-sm text-text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-text-secondary">history</span>
              Recent Resolved / Merged PR Reviews
            </h3>
<span className="text-[12px] font-badge-mono text-text-muted">121 total archived</span>
</div>

<div className="bg-surface-elevated border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
<div className="flex items-center gap-3">
<div className="w-7 h-7 rounded-md bg-secondary/10 text-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">call_merge</span>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-label-ui text-label-ui font-medium text-text-primary hover:underline cursor-pointer">
                    Update PostgreSQL connection pool configuration
                  </span>
<span className="font-badge-mono text-[11px] text-text-muted">#275</span>
</div>
<div className="text-[12px] font-body-sm text-text-secondary flex items-center gap-1.5 mt-0.5">
<span>by @devops-bot</span>
<span>·</span>
<span>Merged into <code className="font-badge-mono text-[11px] bg-surface-subtle px-1 rounded">main</code></span>
</div>
</div>
</div>
<div className="flex items-center gap-2 sm:self-center">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-badge-mono bg-surface-subtle text-text-secondary border border-border">
                Passed with suggestions
              </span>
<span className="text-[11px] font-badge-mono text-text-muted">Yesterday</span>
</div>
</div>

<div className="bg-surface-elevated border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
<div className="flex items-center gap-3">
<div className="w-7 h-7 rounded-md bg-secondary/10 text-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">call_merge</span>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-label-ui text-label-ui font-medium text-text-primary hover:underline cursor-pointer">
                    Fix JWT expiration time drift
                  </span>
<span className="font-badge-mono text-[11px] text-text-muted">#270</span>
</div>
<div className="text-[12px] font-body-sm text-text-secondary flex items-center gap-1.5 mt-0.5">
<span>by @alexdev</span>
<span>·</span>
<span>Merged into <code className="font-badge-mono text-[11px] bg-surface-subtle px-1 rounded">main</code></span>
</div>
</div>
</div>
<div className="flex items-center gap-2 sm:self-center">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-badge-mono bg-success-subtle text-success border border-success/30">
                Passed clean
              </span>
<span className="text-[11px] font-badge-mono text-text-muted">2 days ago</span>
</div>
</div>
</div>
</div>

<div className="lg:col-span-4 flex flex-col gap-6">

<div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm">
<div className="flex items-center justify-between pb-3 border-b border-border">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-accent-ai-hover text-[18px]">smart_toy</span>
<h3 className="font-title-card-sm text-title-card-sm text-text-primary">Repository AI Engine</h3>
</div>
<span className="font-badge-mono text-[11px] px-2 py-0.5 rounded bg-accent-ai-subtle text-accent-ai-hover font-medium">Configured</span>
</div>
<div className="flex flex-col gap-3.5 mt-4 text-[13px] font-body-sm">

<div>
<span className="font-label-ui text-[11px] text-text-muted uppercase tracking-wider block mb-1">Active AI Engine</span>
<div className="font-label-ui text-text-primary font-medium flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-accent-ai-hover"></span>
                Gemini 1.5 Pro (Primary)
              </div>
<div className="text-[11px] text-text-secondary font-badge-mono mt-0.5 pl-3.5">
                Failover: Claude 3.5 Sonnet
              </div>
</div>

<div className="pt-2 border-t border-border/70">
<span className="font-label-ui text-[11px] text-text-muted uppercase tracking-wider block mb-1">Scan Scope</span>
<div className="font-label-ui text-text-primary font-medium">Full AST + Git Diff analysis</div>
<div className="text-[11px] text-text-secondary">Parses dependency call graphs across commits</div>
</div>

<div className="pt-2 border-t border-border/70">
<span className="font-label-ui text-[11px] text-text-muted uppercase tracking-wider block mb-1">Privacy &amp; Ingestion</span>
<div className="flex items-center gap-1.5 font-label-ui text-text-primary font-medium">
<span className="material-symbols-outlined text-success text-[15px]">lock</span>
                Strict Ephemeral Context
              </div>
<div className="text-[11px] text-text-secondary">No repository source code stored at rest</div>
</div>

<div className="pt-2 border-t border-border/70">
<span className="font-label-ui text-[11px] text-text-muted uppercase tracking-wider block mb-1">Review Delivery</span>
<div className="font-label-ui text-text-primary font-medium">Inline diff comments + Summary review</div>
</div>

<div className="pt-2 border-t border-border/70">
<span className="font-label-ui text-[11px] text-text-muted uppercase tracking-wider block mb-1">Ignored Paths</span>
<div className="flex flex-wrap gap-1 mt-1">
<code className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border font-badge-mono text-[11px] text-text-secondary">**/*.test.ts</code>
<code className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border font-badge-mono text-[11px] text-text-secondary">docs/**</code>
<code className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border font-badge-mono text-[11px] text-text-secondary">dist/**</code>
</div>
</div>
</div>
</div>

<div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm">
<div className="flex items-center justify-between pb-3 border-b border-border">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-primary text-[18px]">verified_user</span>
<h3 className="font-title-card-sm text-title-card-sm text-text-primary">Security &amp; Gate Policy</h3>
</div>
<span className="font-badge-mono text-[11px] text-text-secondary">Enforced</span>
</div>
<div className="flex flex-col gap-3 mt-4 text-[13px] font-body-sm">
<div className="flex items-start justify-between">
<div>
<div className="font-label-ui text-label-ui font-medium text-text-primary">Security Blockers</div>
<div className="text-[11px] text-text-secondary">Fails status check on Critical/High findings</div>
</div>
<span className="px-2 py-0.5 rounded text-[11px] font-badge-mono bg-error-subtle text-error font-medium">Block</span>
</div>
<div className="pt-2.5 border-t border-border flex items-start justify-between">
<div>
<div className="font-label-ui text-label-ui font-medium text-text-primary">Performance Gate</div>
<div className="text-[11px] text-text-secondary">Alerts on O(n^2) nested queries and leaks</div>
</div>
<span className="px-2 py-0.5 rounded text-[11px] font-badge-mono bg-warning-subtle text-warning font-medium">Warn</span>
</div>
<div className="pt-2.5 border-t border-border flex items-start justify-between">
<div>
<div className="font-label-ui text-label-ui font-medium text-text-primary">Strict Type Checking</div>
<div className="text-[11px] text-text-secondary">Rejects explicit <code className="font-badge-mono text-[10px]">any</code> in TS modules</div>
</div>
<span className="px-2 py-0.5 rounded text-[11px] font-badge-mono bg-success-subtle text-success font-medium">Active</span>
</div>
</div>
</div>

<div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-sm">
<div className="flex items-center justify-between pb-3 border-b border-border">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-primary text-[18px]">group</span>
<h3 className="font-title-card-sm text-title-card-sm text-text-primary">Active Collaborators</h3>
</div>
<span className="font-badge-mono text-[11px] text-text-muted">3 members</span>
</div>
<div className="flex flex-col gap-3 mt-3.5">

<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-full bg-accent-ai-subtle border border-accent-ai-hover/30 flex items-center justify-center font-badge-mono text-[11px] font-bold text-accent-ai-hover">
                  KR
                </div>
<div>
<div className="font-label-ui text-[13px] font-medium text-text-primary leading-tight">@karanray06</div>
<div className="font-badge-mono text-[10px] text-text-muted">Lead Maintainer</div>
</div>
</div>
<div className="text-right font-badge-mono text-[11px] text-text-secondary">
                52 PRs · 94% pass
              </div>
</div>

<div className="flex items-center justify-between pt-2 border-t border-border/70">
<div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-full bg-surface-subtle border border-border flex items-center justify-center font-badge-mono text-[11px] font-bold text-text-primary">
                  AD
                </div>
<div>
<div className="font-label-ui text-[13px] font-medium text-text-primary leading-tight">@alexdev</div>
<div className="font-badge-mono text-[10px] text-text-muted">Backend Engineer</div>
</div>
</div>
<div className="text-right font-badge-mono text-[11px] text-text-secondary">
                41 PRs · 83% pass
              </div>
</div>

<div className="flex items-center justify-between pt-2 border-t border-border/70">
<div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-full bg-surface-subtle border border-border flex items-center justify-center font-badge-mono text-[11px] font-bold text-text-primary">
                  SM
                </div>
<div>
<div className="font-label-ui text-[13px] font-medium text-text-primary leading-tight">@sarah-m</div>
<div className="font-badge-mono text-[10px] text-text-muted">Security Reviewer</div>
</div>
</div>
<div className="text-right font-badge-mono text-[11px] text-text-secondary">
                31 PRs · 97% pass
              </div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
    </>
  );
}
