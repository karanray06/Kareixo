export default function ReviewDetails() {
  return (
    <>
      <div className="flex flex-col w-full">

<div className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
<div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-ai-subtle/60 rounded-full blur-3xl pointer-events-none -z-10"></div>

<div className="flex flex-wrap items-center justify-between gap-4 pb-6">
<div className="flex items-center gap-2">
<a className="inline-flex items-center gap-1.5 font-label-ui text-label-ui text-text-secondary hover:text-text-primary transition-colors py-1 px-2.5 rounded-lg bg-surface-subtle hover:bg-surface-container" href="#">
<span className="material-symbols-outlined text-[16px]">arrow_back</span>
<span>api-service / Pull Requests</span>
</a>
<span className="text-text-muted">/</span>
<span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded-md bg-surface-container-high text-text-primary">#284</span>
</div>

<div className="flex flex-wrap items-center gap-2.5">
<button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-surface-elevated text-text-primary font-label-ui text-label-ui shadow-sm hover:bg-surface-subtle transition-all duration-150 ease-out active:scale-95" id="btn-export" onclick="showExportToast()">
<span className="material-symbols-outlined text-[17px] text-text-secondary">download</span>
<span>Export JSON</span>
</button>
<button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-surface-elevated text-text-primary font-label-ui text-label-ui shadow-sm hover:bg-surface-subtle transition-all duration-150 ease-out active:scale-95" id="btn-rerun" onclick="triggerRerun(this)">
<span className="material-symbols-outlined text-[17px] text-text-secondary">refresh</span>
<span id="rerun-label">Re-run Review</span>
</button>
<a className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-surface-elevated text-text-primary font-label-ui text-label-ui shadow-sm hover:bg-surface-subtle transition-all duration-150 ease-out" href="https://github.com" rel="noreferrer" target="_blank">
<span>GitHub</span>
<span className="material-symbols-outlined text-[15px]">open_in_new</span>
</a>
<button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui shadow-md hover:bg-primary-container transition-all duration-150 ease-out hover:-translate-y-[1px]" id="btn-apply-all" onclick="applyAllSuggestions(this)">
<span className="material-symbols-outlined text-[16px] text-secondary-fixed">auto_fix_high</span>
<span>Apply All Fixes via PR</span>
</button>
</div>
</div>

<div className="bg-surface-elevated rounded-xl p-6 shadow-sm mb-6">
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
<div className="space-y-2">
<div className="flex flex-wrap items-center gap-3">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-subtle font-badge-mono text-badge-mono text-warning">
<span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
              Needs Attention
            </span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-subtle font-badge-mono text-badge-mono text-error">
<span className="material-symbols-outlined text-[14px]">gpp_bad</span>
              1 Blocker
            </span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-ai-subtle font-badge-mono text-badge-mono text-accent-ai-hover">
<span className="material-symbols-outlined text-[14px]">psychology</span>
              Gemini 1.5 Pro
            </span>
</div>
<h1 className="font-headline-section text-headline-section text-text-primary tracking-tight">
            Add authentication middleware &amp; timing attack guard
          </h1>

<div className="flex flex-wrap items-center gap-y-2 gap-x-4 font-body-sm text-body-sm text-text-secondary pt-1">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-text-muted">account_tree</span>
<span className="font-badge-mono text-badge-mono text-text-primary">karanray06/api-service</span>
<span className="text-text-muted">#284</span>
</div>
<span className="text-text-muted">•</span>
<div className="flex items-center gap-1.5">
<span className="font-badge-mono text-badge-mono bg-surface-subtle px-2 py-0.5 rounded text-text-primary">feature/auth-guard</span>
<span className="text-text-muted">into</span>
<span className="font-badge-mono text-badge-mono bg-surface-subtle px-2 py-0.5 rounded text-text-primary">main</span>
</div>
<span className="text-text-muted">•</span>
<div className="flex items-center gap-1 font-badge-mono text-badge-mono">
<span className="material-symbols-outlined text-[16px] text-text-muted">commit</span>
<span>7f9c2d1</span>
</div>
<span className="text-text-muted">•</span>
<div className="flex items-center gap-1.5">
<img className="w-4 h-4 rounded-full object-cover" data-alt="Minimal developer avatar badge with clean monochrome profile silhouette on neutral slate background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe6WR4xHWIYZkT__Jy8sG19_KryxrYJelx9bxQQBUxdic8bFVnYUCy7DEUUcrTMZDvaVSnlaUxgTRxx_lDUysZiFsEUyRIxrTMGTlUNZwa3yuzYNfUIYLYzPX_LwU0SKxHuUkfVQBHpLtilQFJAH2Tb4aKEyR5p71RaFSt3gsxVCmPlNpSF-MZDT9fq4uA5Jklo6eqrjTCGvU_nV7yzFs-4JW0d3MWbVLLJwVelhYdTiFatzdtAGqw"/>
<span className="text-text-primary">@alexdev</span>
</div>
<span className="text-text-muted">•</span>
<span className="text-text-muted">Reviewed 3m ago</span>
</div>
</div>

<div className="flex sm:flex-row flex-col items-start sm:items-center gap-4 bg-surface-subtle p-4 rounded-xl self-stretch lg:self-center">
<div className="w-10 h-10 rounded-lg bg-error flex items-center justify-center text-on-error flex-shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[24px]">shield_lock</span>
</div>
<div>
<div className="font-title-card-sm text-title-card-sm text-text-primary">Security Gate Failed</div>
<div className="font-body-sm text-body-sm text-text-secondary">Direct string comparator leaks execution time (CWE-208).</div>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
<div className="bg-surface-elevated rounded-xl p-4 shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-text-secondary mb-2">
<span className="font-label-ui text-label-ui uppercase tracking-wider text-text-muted">Total Findings</span>
<span className="material-symbols-outlined text-[18px]">policy</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-display-hero-mobile text-display-hero-mobile text-text-primary">4</span>
<span className="font-badge-mono text-badge-mono text-error font-semibold">2 High</span>
<span className="font-badge-mono text-badge-mono text-warning">1 Med</span>
<span className="font-badge-mono text-badge-mono text-text-muted">1 Low</span>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden flex">
<div className="bg-error h-full" style={{ width: "50%" }}></div>
<div className="bg-warning h-full" style={{ width: "25%" }}></div>
<div className="bg-secondary-container h-full" style={{ width: "25%" }}></div>
</div>
</div>
<div className="bg-surface-elevated rounded-xl p-4 shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-text-secondary mb-2">
<span className="font-label-ui text-label-ui uppercase tracking-wider text-text-muted">Files &amp; Diff Scope</span>
<span className="material-symbols-outlined text-[18px]">data_object</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-display-hero-mobile text-display-hero-mobile text-text-primary">3</span>
<span className="font-body-sm text-body-sm text-text-secondary">files</span>
<span className="font-badge-mono text-badge-mono text-success ml-auto">+46</span>
<span className="font-badge-mono text-badge-mono text-error">-12</span>
</div>
<div className="font-badge-mono text-badge-mono text-text-muted mt-3">124 lines analyzed</div>
</div>
<div className="bg-surface-elevated rounded-xl p-4 shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-text-secondary mb-2">
<span className="font-label-ui text-label-ui uppercase tracking-wider text-text-muted">Turnaround</span>
<span className="material-symbols-outlined text-[18px]">bolt</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-display-hero-mobile text-display-hero-mobile text-text-primary">18.4s</span>
<span className="font-badge-mono text-badge-mono text-success">p95 fast</span>
</div>
<div className="font-body-sm text-body-sm text-text-muted mt-3 flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-success"></span>
<span>Zero Code Stored</span>
</div>
</div>
<div className="bg-surface-elevated rounded-xl p-4 shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-text-secondary mb-2">
<span className="font-label-ui text-label-ui uppercase tracking-wider text-text-muted">Test Coverage Gate</span>
<span className="material-symbols-outlined text-[18px]">checklist</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-display-hero-mobile text-display-hero-mobile text-text-primary">84.2%</span>
<span className="font-badge-mono text-badge-mono text-success">+0.4%</span>
</div>
<div className="font-body-sm text-body-sm text-text-secondary mt-3">Exceeds 80.0% threshold</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

<div className="lg:col-span-3 space-y-4 sticky top-20">
<div className="bg-surface-elevated rounded-xl p-4 shadow-sm space-y-4">
<div className="flex items-center justify-between pb-2">
<span className="font-title-card-sm text-title-card-sm text-text-primary">Files Changed</span>
<span className="font-badge-mono text-badge-mono text-text-muted">3 files</span>
</div>

<div className="grid grid-cols-4 gap-1 p-1 bg-surface-subtle rounded-lg font-badge-mono text-[11px] leading-4 text-center">
<button className="filter-btn active-filter py-1 rounded font-medium bg-surface-elevated shadow-sm text-text-primary" onclick="filterFindings(&apos;all&apos;, this)">All (4)</button>
<button className="filter-btn py-1 rounded font-medium text-text-secondary hover:text-text-primary" onclick="filterFindings(&apos;security&apos;, this)">Sec (2)</button>
<button className="filter-btn py-1 rounded font-medium text-text-secondary hover:text-text-primary" onclick="filterFindings(&apos;perf&apos;, this)">Perf (1)</button>
<button className="filter-btn py-1 rounded font-medium text-text-secondary hover:text-text-primary" onclick="filterFindings(&apos;quality&apos;, this)">Qual (1)</button>
</div>

<div className="space-y-1.5 font-label-ui text-label-ui">

<button className="w-full text-left p-2.5 rounded-lg bg-surface-subtle text-text-primary font-medium flex flex-col gap-1.5 transition-colors" onclick="switchActiveFile(this, &apos;file-auth-guard&apos;)">
<div className="flex items-center justify-between w-full">
<span className="truncate font-badge-mono text-badge-mono">auth.guard.ts</span>
<span className="flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span className="w-2 h-2 rounded-full bg-warning"></span>
</span>
</div>
<span className="text-[11px] text-text-muted truncate font-badge-mono">src/middleware/</span>
</button>

<button className="w-full text-left p-2.5 rounded-lg hover:bg-surface-subtle text-text-secondary hover:text-text-primary flex flex-col gap-1.5 transition-colors" onclick="switchActiveFile(this, &apos;file-session-service&apos;)">
<div className="flex items-center justify-between w-full">
<span className="truncate font-badge-mono text-badge-mono">session.service.ts</span>
<span className="w-2 h-2 rounded-full bg-secondary-container"></span>
</div>
<span className="text-[11px] text-text-muted truncate font-badge-mono">src/services/</span>
</button>

<button className="w-full text-left p-2.5 rounded-lg hover:bg-surface-subtle text-text-secondary hover:text-text-primary flex flex-col gap-1.5 transition-colors" onclick="switchActiveFile(this, &apos;file-middleware-config&apos;)">
<div className="flex items-center justify-between w-full">
<span className="truncate font-badge-mono text-badge-mono">middleware.config.ts</span>
<span className="w-2 h-2 rounded-full bg-outline"></span>
</div>
<span className="text-[11px] text-text-muted truncate font-badge-mono">src/config/</span>
</button>
</div>

<div className="pt-3">
<span className="font-label-ui text-[11px] uppercase tracking-wider text-text-muted block mb-2.5">Jump to Finding</span>
<ul className="space-y-2 font-body-sm text-body-sm">
<li>
<a className="flex items-start gap-2 text-text-secondary hover:text-error transition-colors group" href="#finding-1">
<span className="w-1.5 h-1.5 rounded-full bg-error mt-2 flex-shrink-0"></span>
<span className="font-badge-mono text-[12px] leading-tight truncate">CWE-208 Timing Attack (:42)</span>
</a>
</li>
<li>
<a className="flex items-start gap-2 text-text-secondary hover:text-warning transition-colors group" href="#finding-2">
<span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0"></span>
<span className="font-badge-mono text-[12px] leading-tight truncate">Uncached JWKS Lookup (:78)</span>
</a>
</li>
<li>
<a className="flex items-start gap-2 text-text-secondary hover:text-text-primary transition-colors group" href="#finding-3">
<span className="w-1.5 h-1.5 rounded-full bg-secondary-container mt-2 flex-shrink-0"></span>
<span className="font-badge-mono text-[12px] leading-tight truncate">Missing return type (:19)</span>
</a>
</li>
</ul>
</div>

<div className="bg-surface-subtle rounded-lg p-3 space-y-2">
<div className="flex items-center justify-between">
<span className="font-label-ui text-[11px] uppercase tracking-wider text-text-muted">Engine Diagnostics</span>
<span className="font-badge-mono text-[10px] text-accent-ai-hover bg-accent-ai-subtle px-1.5 py-0.5 rounded">v2.4 AST</span>
</div>
<div className="font-badge-mono text-[11px] text-text-secondary space-y-1">
<div className="flex justify-between">
<span>Model:</span>
<span className="text-text-primary">Gemini 1.5 Pro</span>
</div>
<div className="flex justify-between">
<span>Tokens:</span>
<span className="text-text-primary">14,209 tk</span>
</div>
<div className="flex justify-between">
<span>Latency:</span>
<span className="text-text-primary">1.42s</span>
</div>
<div className="flex justify-between">
<span>AST Pass:</span>
<span className="text-success font-semibold">100% OK</span>
</div>
</div>
</div>
</div>

<div className="bg-surface-elevated rounded-xl p-4 shadow-sm overflow-hidden relative">
<div className="font-label-ui text-label-ui text-text-primary mb-1">Architecture Impact</div>
<p className="font-body-sm text-[12px] leading-relaxed text-text-secondary mb-3">Edge authorization layer handles all incoming ingress payloads.</p>
<img className="w-full h-24 rounded-lg object-cover" data-alt="Minimalist abstract system diagram graphic representing cryptographic key verification pipelines and secure authentication tokens in sleek monochrome design with violet focal nodes" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcHKX9Qlylen9qoVm-EjqWymfATCXUa_j5Bff2xJ1NNf_v-TLlkVIx80CE5nh48DK8foxg9hD2FjHU8w2JswdWi1DWw53mRoZ8__0fuFzGcjyRyHwQ1SvBm4AQK3NxpbpIBhnEeDhElXk5yFbd18hn1qQK5mrfVqI9mIiMdH1iwAKHOwy_T-ojTMPDxrQQ1MUy8wZXZD-HIcuRkwwHvlnsEBhLfSbS01r-biMJ1InEQ8uhoAlFHvYl"/>
</div>
</div>

<div className="lg:col-span-6 space-y-6">

<div className="flex items-center justify-between px-2">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[20px] text-text-muted">description</span>
<span className="font-badge-mono text-badge-mono font-semibold text-text-primary">src/middleware/auth.guard.ts</span>
<span className="font-badge-mono text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-text-secondary">+28 -6</span>
</div>
<span className="font-body-sm text-body-sm text-text-muted">2 diagnostics</span>
</div>

<div className="finding-card security-finding bg-surface-elevated rounded-xl shadow-sm overflow-hidden transition-all duration-200" id="finding-1">

<div className="p-5 pb-4 bg-surface-elevated">
<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-subtle font-badge-mono text-badge-mono text-error font-medium">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                  Security • High Severity
                </span>
<span className="font-badge-mono text-badge-mono text-text-muted bg-surface-subtle px-2 py-0.5 rounded">CWE-208</span>
</div>
<span className="font-badge-mono text-badge-mono text-text-muted">Lines 41-45</span>
</div>
<h2 className="font-title-card text-title-card text-text-primary">
              Insecure direct string comparison flagged in token validator
            </h2>
</div>

<div className="bg-surface-subtle overflow-x-auto">
<div className="px-4 py-2 bg-surface-container text-text-muted font-badge-mono text-[11px] flex items-center justify-between">
<span>@@ -40,5 +40,5 @@ validateApiKey(req: Request)</span>
<span>TypeScript</span>
</div>
<table className="w-full text-left font-code-diff text-code-diff border-collapse">
<tbody>
<tr className="hover:bg-surface-container-high/40 transition-colors">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-surface-subtle text-right">40</td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-surface-subtle text-right">40</td>
<td className="px-4 py-1 text-text-secondary whitespace-pre font-code-diff"><span className="text-text-muted"> </span>const reqToken = req.headers[&apos;x-api-token&apos;] as string;</td>
</tr>
<tr className="hover:bg-surface-container-high/40 transition-colors">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-surface-subtle text-right">41</td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-surface-subtle text-right">41</td>
<td className="px-4 py-1 text-text-secondary whitespace-pre font-code-diff"><span className="text-text-muted"> </span>if (!reqToken) throw new UnauthorizedException();</td>
</tr>
<tr className="bg-error-subtle/40 text-error">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-error select-none bg-error-subtle/60 text-right">42</td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-error-subtle/30 text-right"></td>
<td className="px-4 py-1 whitespace-pre font-code-diff font-medium"><span>- </span>if (reqToken === storedToken.secret) return next();</td>
</tr>
<tr className="bg-success-subtle/50 text-success">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-success-subtle/30 text-right"></td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-success select-none bg-success-subtle/60 text-right">42</td>
<td className="px-4 py-1 whitespace-pre font-code-diff font-medium"><span>+ </span>const a = Buffer.from(reqToken);</td>
</tr>
<tr className="bg-success-subtle/50 text-success">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-success-subtle/30 text-right"></td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-success select-none bg-success-subtle/60 text-right">43</td>
<td className="px-4 py-1 whitespace-pre font-code-diff font-medium"><span>+ </span>const b = Buffer.from(storedToken.secret);</td>
</tr>
<tr className="bg-success-subtle/50 text-success">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-success-subtle/30 text-right"></td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-success select-none bg-success-subtle/60 text-right">44</td>
<td className="px-4 py-1 whitespace-pre font-code-diff font-medium"><span>+ </span>if (a.length === b.length &amp;&amp; crypto.timingSafeEqual(a, b)) return next();</td>
</tr>
<tr className="hover:bg-surface-container-high/40 transition-colors">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-surface-subtle text-right">43</td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-surface-subtle text-right">45</td>
<td className="px-4 py-1 text-text-secondary whitespace-pre font-code-diff"><span className="text-text-muted"> </span>throw new ForbiddenException(&apos;Invalid credentials&apos;);</td>
</tr>
</tbody>
</table>
</div>

<div className="p-5 space-y-4 bg-surface-elevated">
<div className="space-y-2">
<div className="font-label-ui text-label-ui text-text-primary flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-accent-ai-hover">info</span>
<span>Why this matters</span>
</div>
<p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                Standard triple-equals comparison (<code className="bg-surface-subtle px-1.5 py-0.5 rounded font-badge-mono text-badge-mono text-text-primary">===</code>) returns <code className="font-badge-mono text-badge-mono">false</code> immediately upon the first byte mismatch. An attacker sending thousands of statistical requests can measure nanosecond delays to reconstruct valid API keys character-by-character.
              </p>
</div>

<div className="p-3.5 bg-surface-subtle rounded-lg space-y-1.5">
<span className="font-label-ui text-[11px] uppercase tracking-wider text-text-muted block">Evidence &amp; AST Trace</span>
<p className="font-body-sm text-body-sm text-text-secondary">
                Untrusted identifier <code className="font-badge-mono text-badge-mono text-error font-medium">reqToken</code> sourced from raw HTTP header directly enters equality test node against sensitive credentials store without constant-time dampening.
              </p>
</div>

<div className="flex items-center justify-between pt-2">
<div className="flex items-center gap-2">
<button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-text-primary text-on-primary font-label-ui text-label-ui shadow-sm hover:bg-black transition-all duration-150 ease-out" onclick="applySpecificFix(this, &apos;finding-1&apos;)">
<span className="material-symbols-outlined text-[16px] text-accent-ai-hover">magic_button</span>
<span>Apply fix to PR</span>
</button>
<button className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-text-secondary hover:text-text-primary font-label-ui text-label-ui hover:bg-surface-subtle transition-colors">
<span>View in GitHub Diff</span>
<span className="material-symbols-outlined text-[15px]">arrow_outward</span>
</button>
</div>
<span className="font-badge-mono text-[11px] text-text-muted">Auto-commit target: HEAD</span>
</div>
</div>
</div>

<div className="finding-card perf-finding bg-surface-elevated rounded-xl shadow-sm overflow-hidden transition-all duration-200" id="finding-2">
<div className="p-5 pb-4">
<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warning-subtle font-badge-mono text-badge-mono text-warning font-medium">
<span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                  Performance • Medium Severity
                </span>
<span className="font-badge-mono text-badge-mono text-text-muted bg-surface-subtle px-2 py-0.5 rounded">PERF-CACHE-02</span>
</div>
<span className="font-badge-mono text-badge-mono text-text-muted">Line 78</span>
</div>
<h2 className="font-title-card text-title-card text-text-primary">
              Uncached JWT verification key lookup on every incoming request
            </h2>
</div>

<div className="bg-surface-subtle overflow-x-auto">
<div className="px-4 py-2 bg-surface-container text-text-muted font-badge-mono text-[11px] flex items-center justify-between">
<span>@@ -76,4 +76,5 @@ resolveSigningKey(header: JwtHeader)</span>
<span>TypeScript</span>
</div>
<table className="w-full text-left font-code-diff text-code-diff border-collapse">
<tbody>
<tr className="hover:bg-surface-container-high/40 transition-colors">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-surface-subtle text-right">76</td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-surface-subtle text-right">76</td>
<td className="px-4 py-1 text-text-secondary whitespace-pre font-code-diff"><span className="text-text-muted"> </span>const kid = header.kid;</td>
</tr>
<tr className="bg-error-subtle/40 text-error">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-error select-none bg-error-subtle/60 text-right">77</td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-error-subtle/30 text-right"></td>
<td className="px-4 py-1 whitespace-pre font-code-diff font-medium"><span>- </span>const key = await this.remoteJwksClient.getSigningKey(kid);</td>
</tr>
<tr className="bg-success-subtle/50 text-success">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-success-subtle/30 text-right"></td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-success select-none bg-success-subtle/60 text-right">77</td>
<td className="px-4 py-1 whitespace-pre font-code-diff font-medium"><span>+ </span>const key = await this.memoizedJwksCache.getOrFetch(kid, () =&gt;</td>
</tr>
<tr className="bg-success-subtle/50 text-success">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-success-subtle/30 text-right"></td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-success select-none bg-success-subtle/60 text-right">78</td>
<td className="px-4 py-1 whitespace-pre font-code-diff font-medium"><span>+ </span>  this.remoteJwksClient.getSigningKey(kid)</td>
</tr>
<tr className="bg-success-subtle/50 text-success">
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-text-muted select-none bg-success-subtle/30 text-right"></td>
<td className="w-10 px-3 py-1 font-code-gutter text-code-gutter text-success select-none bg-success-subtle/60 text-right">79</td>
<td className="px-4 py-1 whitespace-pre font-code-diff font-medium"><span>+ </span>);</td>
</tr>
</tbody>
</table>
</div>
<div className="p-5 space-y-4">
<p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              Remote JWKS endpoints induce 40-120ms roundtrip network latency on critical API endpoints. Utilizing an in-memory LRU cache prevents rate-limiting trips from authorization servers.
            </p>
<div className="flex items-center justify-between pt-1">
<button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-surface-elevated text-text-primary font-label-ui text-label-ui shadow-sm hover:bg-surface-subtle transition-all duration-150 ease-out" onclick="applySpecificFix(this, &apos;finding-2&apos;)">
<span className="material-symbols-outlined text-[16px] text-text-secondary">check</span>
<span>Apply Cache Wrapper</span>
</button>
<span className="font-badge-mono text-badge-mono text-success flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">trending_up</span>
                ∼85ms latency recovered
              </span>
</div>
</div>
</div>

<div className="finding-card quality-finding bg-surface-elevated rounded-xl shadow-sm overflow-hidden transition-all duration-200" id="finding-3">
<div className="p-5 pb-3">
<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-ai-subtle font-badge-mono text-badge-mono text-accent-ai-hover font-medium">
<span className="w-1.5 h-1.5 rounded-full bg-accent-ai-hover"></span>
                  Code Quality • Low Severity
                </span>
<span className="font-badge-mono text-badge-mono text-text-muted bg-surface-subtle px-2 py-0.5 rounded">TS-STRICT-23</span>
</div>
<span className="font-badge-mono text-badge-mono text-text-muted">session.service.ts:19</span>
</div>
<h2 className="font-title-card text-title-card text-text-primary">
              Explicit return type missing on session teardown lifecycle
            </h2>
<p className="font-body-sm text-body-sm text-text-secondary mt-2">
              Method <code className="font-badge-mono text-badge-mono bg-surface-subtle px-1.5 py-0.5 rounded text-text-primary">purgeExpiredSessions()</code> implicit <code className="font-badge-mono text-badge-mono">Promise&lt;any&gt;</code> return weakens boundary typing in downstream controllers.
            </p>
</div>
<div className="px-5 pb-5 pt-2 flex items-center justify-between">
<button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-ui text-label-ui transition-colors" onclick="applySpecificFix(this, &apos;finding-3&apos;)">
<span className="material-symbols-outlined text-[15px]">auto_fix_normal</span>
<span>Annotate Return Type</span>
</button>
<span className="font-badge-mono text-[11px] text-text-muted">Cleaned by Kareixo Rule #41</span>
</div>
</div>

<div className="bg-surface-elevated rounded-xl p-5 shadow-sm">
<div className="flex items-center justify-between mb-3">
<div>
<span className="font-title-card-sm text-title-card-sm text-text-primary">Audit Trail &amp; Sign-off</span>
<p className="font-body-sm text-body-sm text-text-secondary">Security team policy mandates cryptographically validated token paths.</p>
</div>
<span className="material-symbols-outlined text-[20px] text-text-muted">verified_user</span>
</div>
<div className="grid grid-cols-2 gap-3">
<img className="w-full h-32 rounded-lg object-cover" data-alt="Close up photography of modern developer laptop screen showing monochrome git terminal logs and source code analysis tools in crisp light studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBr6zmqFCfLHLWRbq75jeSCkfECKULYfVVeuW44NsAr1N-ZYIoZWh0rtUqzSzjaUGmT1wQTxzNkJERZk3CaDZCqLjkdyZZfgAhPfMPJGiex2o-TxR2SkFB2h1_SHhXphtH6iN0M0HHEFGGP8ktaDcRSnu_dVhBfFoGRKhy46IEaJ1IjnNasHDp2tBQtHjUa1L1hQ7ZjKllw5CAyd1lgrkfKP4_b0LO-Tch05A3VRzGG18Ru4nvbKEQM"/>
<img className="w-full h-32 rounded-lg object-cover" data-alt="High tech software architecture telemetry board with minimal vector data traces and clean dashboard aesthetics in neutral stone palette" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjBdebHcraUfr5Zr1YdcKWqm2myYf4ZBPrNiFu3Jb0Ap3IwWbt7vv3zIbJMGbCZjTKPyPkvvHNQNVnBy6rcPSobhlgCxC0dfeR8Ho1bJAnjusHA4DtMG_qyMR4LA02Of96BshJW20Ffwu0m1NyukVMkTSRXGp7oCeV1g_H7w9tEQDcVNW0rEIdt--IY48CDM8VVfqfpA3Veg4bRnF_cFRTgQNPG6nEAEkzy_ugn6V9JssSc0taT9w2"/>
</div>
</div>
</div>

<div className="lg:col-span-3 space-y-4">

<div className="bg-surface-elevated rounded-xl p-4 shadow-sm space-y-4">
<div className="flex items-center justify-between pb-1">
<span className="font-title-card-sm text-title-card-sm text-text-primary">Policy &amp; Checks</span>
<span className="material-symbols-outlined text-[18px] text-text-muted">verified</span>
</div>
<div className="space-y-3 font-body-sm text-body-sm">
<div className="p-2.5 rounded-lg bg-error-subtle/50 flex items-start gap-2.5">
<span className="material-symbols-outlined text-error text-[18px] mt-0.5 flex-shrink-0">cancel</span>
<div>
<div className="font-label-ui text-label-ui text-text-primary font-medium">Security Policy Gate</div>
<div className="text-[12px] text-error font-medium">Blocked by Timing Attack</div>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-subtle flex items-start gap-2.5">
<span className="material-symbols-outlined text-success text-[18px] mt-0.5 flex-shrink-0">check_circle</span>
<div>
<div className="font-label-ui text-label-ui text-text-primary font-medium">AST Sanity Gate</div>
<div className="text-[12px] text-text-muted">0 parser grammar regressions</div>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-subtle flex items-start gap-2.5">
<span className="material-symbols-outlined text-success text-[18px] mt-0.5 flex-shrink-0">check_circle</span>
<div>
<div className="font-label-ui text-label-ui text-text-primary font-medium">Unit Test Delta</div>
<div className="text-[12px] text-text-muted">84.2% (+0.4% coverage)</div>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-subtle flex items-start gap-2.5">
<span className="material-symbols-outlined text-success text-[18px] mt-0.5 flex-shrink-0">check_circle</span>
<div>
<div className="font-label-ui text-label-ui text-text-primary font-medium">Secret Scanning</div>
<div className="text-[12px] text-text-muted">0 credentials detected</div>
</div>
</div>
</div>
</div>

<div className="bg-surface-elevated rounded-xl p-4 shadow-sm space-y-3">
<div className="flex items-center justify-between pb-1">
<span className="font-title-card-sm text-title-card-sm text-text-primary">Delivery Log</span>
<span className="font-badge-mono text-[10px] text-text-muted">Webhook Synced</span>
</div>
<div className="relative pl-4 space-y-4 text-left font-body-sm text-body-sm before:content-[&apos;&apos;] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
<div className="relative">
<span className="absolute -left-[14.5px] top-1.5 w-2 h-2 rounded-full bg-success ring-4 ring-surface-elevated"></span>
<div className="font-badge-mono text-[11px] text-text-muted">19:42:01 UTC</div>
<div className="text-text-primary font-medium text-[13px]">Inline comments posted</div>
<div className="text-[12px] text-text-secondary">4 annotations published to GitHub PR #284</div>
</div>
<div className="relative">
<span className="absolute -left-[14.5px] top-1.5 w-2 h-2 rounded-full bg-warning ring-4 ring-surface-elevated"></span>
<div className="font-badge-mono text-[11px] text-text-muted">19:41:58 UTC</div>
<div className="text-text-primary font-medium text-[13px]">GitHub Check Status</div>
<div className="text-[12px] text-text-secondary">kareixo/pr-review • Action Required</div>
</div>
<div className="relative">
<span className="absolute -left-[14.5px] top-1.5 w-2 h-2 rounded-full bg-text-muted ring-4 ring-surface-elevated"></span>
<div className="font-badge-mono text-[11px] text-text-muted">19:41:40 UTC</div>
<div className="text-text-primary font-medium text-[13px]">Webhook Trigger</div>
<div className="text-[12px] text-text-secondary">Received push on feature branch</div>
</div>
</div>
</div>

<div className="bg-surface-elevated rounded-xl p-4 shadow-sm space-y-2">
<div className="flex items-center gap-2 text-text-primary font-title-card-sm text-title-card-sm">
<span className="material-symbols-outlined text-[18px] text-success">lock</span>
<span>Ephemeral Privacy</span>
</div>
<p className="font-body-sm text-[12px] text-text-secondary leading-relaxed">
            Code analyzed in-memory. Zero source code retention or model weights training. Ephemeral cache purged immediately upon webhook dispatch completion.
          </p>
<div className="pt-2">
<a className="inline-flex items-center gap-1 font-label-ui text-[12px] text-text-primary hover:underline" href="#">
<span>Read SOC-2 Type II report</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</a>
</div>
</div>
</div>
</div>
</div>

<div className="fixed bottom-6 right-6 translate-y-20 opacity-0 transition-all duration-300 pointer-events-none z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-text-primary text-on-primary shadow-xl" id="toast-msg">
<span className="material-symbols-outlined text-success text-[20px]" id="toast-icon">check_circle</span>
<span className="font-body-sm text-body-sm" id="toast-text">Action completed</span>
</div>


</div>
    </>
  );
}
