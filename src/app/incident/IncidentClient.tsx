"use client";

import { useState } from "react";
import { FiAlertTriangle, FiGitPullRequest, FiArrowRight, FiFile, FiMessageSquare, FiLoader, FiCheckCircle } from "react-icons/fi";

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

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-coral)]/15 flex items-center justify-center">
            <FiAlertTriangle className="w-5 h-5 text-[var(--color-coral)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Paste Stack Trace</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Kareixo will trace each frame back to the commit and PR that introduced it.
            </p>
          </div>
        </div>

        {/* Repo Selector */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Repository</label>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full bg-[var(--bg-base)] border border-[var(--color-outline)]/20 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--color-sky-blue)]"
          >
            {repos.map((r) => (
              <option key={r.fullName} value={r.fullName}>{r.fullName}</option>
            ))}
          </select>
        </div>

        {/* Stack Trace Input */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Stack Trace</label>
          <textarea
            value={stackTrace}
            onChange={(e) => setStackTrace(e.target.value)}
            placeholder={`Error: Cannot read properties of undefined (reading 'map')\n    at UserList (src/components/UserList.tsx:42:15)\n    at renderWithHooks (node_modules/react-dom/...)\n    at mountIndeterminateComponent (...)`}
            className="w-full bg-[var(--bg-base)] border border-[var(--color-outline)]/20 rounded-xl px-4 py-3 text-xs font-mono leading-relaxed focus:outline-none focus:border-[var(--color-sky-blue)] resize-none"
            rows={10}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !stackTrace.trim() || !selectedRepo}
          className="w-full py-3 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Tracing...
            </>
          ) : (
            <>
              <FiAlertTriangle className="w-4 h-4" />
              Analyze Stack Trace
            </>
          )}
        </button>

        {error && (
          <div className="bg-[var(--color-coral)]/10 text-[var(--color-coral)] p-4 rounded-xl text-sm border border-[var(--color-coral)]/20">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Summary */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiCheckCircle className="w-5 h-5 text-[var(--color-mint)]" />
              <h3 className="font-bold text-lg">Analysis Complete</h3>
            </div>
            <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed bg-[var(--bg-base)] p-4 rounded-xl">
              {result.context.summary}
            </pre>
          </div>

          {/* Resolved Frames */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Traced Frames</h3>
            <div className="space-y-3">
              {result.context.resolvedFrames.map((rf, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--color-outline)]/10">
                  <FiFile className="w-4 h-4 text-[var(--color-sky-blue)] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-mono font-medium">
                      {rf.frame.filePath}
                      <span className="text-[var(--color-coral)]">:{rf.frame.lineNumber}</span>
                    </div>
                    {rf.frame.functionName && (
                      <div className="text-xs text-[var(--text-secondary)]">
                        in <span className="text-[var(--color-mint)]">{rf.frame.functionName}</span>
                      </div>
                    )}
                    {rf.commit && (
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        Last commit: <span className="font-mono">{rf.commit.sha.slice(0, 7)}</span> — "{rf.commit.message.split("\n")[0]}" by {rf.commit.author}
                      </div>
                    )}
                    {rf.pr && (
                      <a
                        href={rf.pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[var(--color-sky-blue)] hover:underline mt-1"
                      >
                        <FiGitPullRequest className="w-3 h-3" />
                        PR #{rf.pr.number}: {rf.pr.title}
                      </a>
                    )}
                    {rf.error && (
                      <div className="text-xs text-[var(--color-coral)] mt-1">Error: {rf.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related PRs */}
          {result.context.relatedPRs.length > 0 && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Related Pull Requests</h3>
              <div className="space-y-2">
                {result.context.relatedPRs.map((pr) => (
                  <a
                    key={pr.number}
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--color-outline)]/10 hover:border-[var(--color-sky-blue)]/30 transition-colors"
                  >
                    <FiGitPullRequest className={`w-4 h-4 ${pr.state === "open" ? "text-emerald-400" : "text-purple-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">#{pr.number} {pr.title}</div>
                      <div className="text-xs text-[var(--text-secondary)] capitalize">{pr.state}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Handoff to CodeChat */}
          <a
            href={result.codeChatUrl}
            className="block w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--color-sky-blue)] to-[var(--color-mint)] text-[var(--bg-base)] font-bold text-center text-sm hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            <span className="flex items-center justify-center gap-2">
              <FiMessageSquare className="w-4 h-4" />
              Open in CodeChat with full context
              <FiArrowRight className="w-4 h-4" />
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
