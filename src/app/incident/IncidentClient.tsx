"use client";

import { useState } from "react";
import { Radar, GitBranch, Database, Bug, RefreshCw, Activity, CheckCircle2, FileText, GitMerge, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";

type RepoInfo = { fullName: string };

type ResolvedFrame = {
  frame: { filePath: string; lineNumber: number; functionName?: string };
  commit?: { sha: string; message: string; author: string };
  pr?: { number: number; title: string; url: string };
  error?: string;
};

type IncidentResult = {
  conversationId: string;
  codeChatUrl: string;
  context: {
    summary: string;
    resolvedFrames: ResolvedFrame[];
    relatedPRs: Array<{ number: number; title: string; url: string; state: string }>;
  };
};

export default function IncidentClient({ repos }: { repos: RepoInfo[] }) {
  const [selectedRepo, setSelectedRepo] = useState(repos[0]?.fullName || "");
  const [stackTrace, setStackTrace] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IncidentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!stackTrace.trim() || !selectedRepo) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stackTrace: stackTrace.trim(),
          repoFullName: selectedRepo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analysis failed");
        return;
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full py-20 px-4">
        <div className="flex flex-col items-center justify-center p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container border border-border-default flex items-center justify-center mb-6 shadow-sm">
            <ShieldCheck size={32} className="text-fg-muted" />
          </div>
          <h2 className="font-title-card text-title-card text-fg-default font-semibold mb-2">
            Connect a Repository
          </h2>
          <p className="font-body-base text-body-base text-fg-muted mb-6">
            Incident Tracer requires a connected repository to analyze stack traces. Install the GitHub App or sync your existing repositories.
          </p>
          <a
            href="/dashboard/repositories"
            className="btn btn-primary"
          >
            Go to Repositories
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Sub-Header / Incident Control Bar */}
      <section className="w-full bg-canvas-subtle border-b border-border-default px-margin py-space-md">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-accent-red shadow-sm border border-border-default">
                <Radar size={18} />
              </div>
              <div>
                <div className="flex items-center gap-space-sm">
                  <h1 className="font-headline-section text-headline-section text-fg-default tracking-tight">
                    Incident Tracer
                  </h1>
                  <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded-full bg-surface-container-high text-accent-purple border border-border-default flex items-center gap-1">
                    <GitBranch size={12} />
                    AST Blame Engine
                  </span>
                </div>
              </div>
            </div>
            {/* Repo selector */}
            <div className="flex items-center gap-space-xs bg-canvas-inset px-3 py-1.5 rounded-lg text-fg-default border border-border-default shadow-sm">
              <Database size={16} className="text-fg-muted" />
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="bg-transparent font-code-diff text-code-diff font-medium outline-none cursor-pointer text-fg-default"
              >
                {repos.length === 0 && <option value="">No repos connected</option>}
                {repos.map((r) => (
                  <option key={r.fullName} value={r.fullName}>
                    {r.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto w-full px-margin py-space-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          {/* Left: Stack Trace Input */}
          <div className="flex flex-col gap-space-md">
            <div className="glass-card p-6 flex flex-col gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-border-default flex items-center justify-center text-accent-red shadow-sm">
                  <Bug size={24} />
                </div>
                <div>
                  <h2 className="font-title-card text-title-card text-fg-default font-semibold">
                    Paste Stack Trace
                  </h2>
                  <p className="font-body-sm text-body-sm text-fg-muted">
                    Kareixo will trace each frame back to the commit and PR that introduced it.
                  </p>
                </div>
              </div>

              <textarea
                value={stackTrace}
                onChange={(e) => setStackTrace(e.target.value)}
                placeholder={`Error: Cannot read properties of undefined (reading 'map')\n    at UserList (src/components/UserList.tsx:42:15)\n    at renderWithHooks (node_modules/react-dom/...)\n    at mountIndeterminateComponent (...)`}
                className="w-full bg-canvas-inset rounded-lg px-space-md py-space-sm font-code-diff text-code-diff text-fg-default placeholder:text-fg-subtle leading-relaxed focus:outline-none focus:ring-1 focus:ring-accent-blue resize-none shadow-inner"
                rows={10}
              />

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !stackTrace.trim() || !selectedRepo}
                className="btn btn-primary w-full py-3 rounded-xl font-title-card-sm text-title-card-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Tracing...
                  </>
                ) : (
                  <>
                    <Radar size={18} />
                    Analyze Stack Trace
                  </>
                )}
              </button>

              {error && (
                <div className="bg-diff-deletion-line text-diff-deletion-text p-space-md rounded-lg font-body-sm text-body-sm border border-accent-red/20">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="flex flex-col gap-space-md">
            {!result && !isAnalyzing && (
              <div className="glass-card p-6 flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-container border border-border-default shadow-sm flex items-center justify-center">
                  <Activity size={32} className="text-fg-muted" />
                </div>
                <p className="font-body-base text-body-base text-fg-muted text-center max-w-sm">
                  Paste a stack trace to trace each frame back to the exact commit and pull
                  request that introduced the bug.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="glass-card p-6 flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-container border border-border-default shadow-sm flex items-center justify-center animate-pulse">
                  <Radar size={32} className="text-accent-blue" />
                </div>
                <p className="font-body-base text-body-base text-fg-muted">
                  Analyzing stack trace...
                </p>
              </div>
            )}

            {result && (
              <>
                {/* Summary */}
                <div className="glass-card p-6 flex flex-col gap-space-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-diff-addition-text" />
                    <h3 className="font-title-card text-title-card text-fg-default font-semibold">
                      Analysis Complete
                    </h3>
                  </div>
                  <pre className="font-code-diff text-code-diff text-fg-muted whitespace-pre-wrap leading-relaxed bg-canvas-inset p-space-md rounded-lg shadow-inner">
                    {result.context.summary}
                  </pre>
                </div>

                {/* Traced Frames */}
                <div className="glass-card p-6 flex flex-col gap-space-sm">
                  <h3 className="font-title-card text-title-card text-fg-default font-semibold">
                    Traced Frames
                  </h3>
                  <div className="flex flex-col gap-space-sm">
                    {result.context.resolvedFrames.map((rf, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-space-sm rounded-lg bg-canvas-default border border-border-default shadow-sm"
                      >
                        <FileText size={18} className="text-accent-blue mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1 flex flex-col gap-1">
                          <div className="font-code-diff text-code-diff text-fg-default font-medium">
                            {rf.frame.filePath}
                            <span className="text-accent-red">:{rf.frame.lineNumber}</span>
                          </div>
                          {rf.frame.functionName && (
                            <div className="font-body-sm text-body-sm text-fg-muted">
                              in{" "}
                              <span className="text-diff-addition-text">
                                {rf.frame.functionName}
                              </span>
                            </div>
                          )}
                          {rf.commit && (
                            <div className="font-body-sm text-body-sm text-fg-muted mt-1">
                              Last commit:{" "}
                              <code className="font-badge-mono text-badge-mono text-fg-default bg-canvas-inset px-1 rounded">
                                {rf.commit.sha.slice(0, 7)}
                              </code>{" "}
                              — &ldquo;{rf.commit.message.split("\n")[0]}&rdquo; by{" "}
                              <span className="text-accent-blue">{rf.commit.author}</span>
                            </div>
                          )}
                          {rf.pr && (
                            <a
                              href={rf.pr.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-body-sm text-body-sm text-accent-blue hover:underline mt-1"
                            >
                              <GitMerge size={14} />
                              PR #{rf.pr.number}: {rf.pr.title}
                            </a>
                          )}
                          {rf.error && (
                            <div className="font-body-sm text-body-sm text-accent-red mt-1">
                              Error: {rf.error}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related PRs */}
                {result.context.relatedPRs.length > 0 && (
                  <div className="glass-card p-6 flex flex-col gap-space-sm">
                    <h3 className="font-title-card text-title-card text-fg-default font-semibold">
                      Related Pull Requests
                    </h3>
                    <div className="flex flex-col gap-space-xs">
                      {result.context.relatedPRs.map((pr) => (
                        <a
                          key={pr.number}
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-space-sm rounded-lg bg-canvas-default border border-border-default shadow-sm hover:border-accent-blue/30 hover:shadow-md transition-all"
                        >
                          <GitMerge
                            size={18}
                            className={
                              pr.state === "open"
                                ? "text-diff-addition-text"
                                : "text-accent-purple"
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-title-card-sm text-title-card-sm text-fg-default font-medium truncate">
                              #{pr.number} {pr.title}
                            </div>
                            <div className="font-body-sm text-body-sm text-fg-muted capitalize">
                              {pr.state}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Handoff to CodeChat */}
                <a
                  href={result.codeChatUrl}
                  className="btn btn-primary w-full py-4 rounded-xl font-title-card-sm text-title-card-sm font-semibold flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} />
                  <span>Open in CodeChat with full context</span>
                  <ArrowRight size={18} />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
