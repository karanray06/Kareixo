"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  GitBranch,
  Package,
  FlaskConical,
  Brain,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Cpu,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  SkipForward,
} from "lucide-react";

// ── Types matching the backend PipelineRun ──
type PipelineStepName =
  | "authenticating" | "fetching_pr" | "checking_cap"
  | "sandbox_booting" | "sandbox_cloning" | "sandbox_installing" | "sandbox_testing"
  | "sandbox_complete" | "sandbox_skipped" | "sandbox_failed"
  | "llm_routing" | "llm_failover" | "llm_complete"
  | "posting_review" | "creating_check" | "complete" | "failed";

type StepStatus = "active" | "complete" | "failed" | "skipped";

interface PipelineStepEntry {
  step: PipelineStepName;
  status: StepStatus;
  timestamp: string;
  detail?: string;
  provider?: string;
  failoverFrom?: string;
}

interface SandboxResultSummary {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  error?: string;
}

interface PipelineRun {
  reviewId: string;
  repoFullName: string;
  prNumber: number;
  steps: PipelineStepEntry[];
  currentStep: PipelineStepName | null;
  sandboxResult?: SandboxResultSummary;
  aiSummary?: string;
  provider?: string;
  startedAt: string;
  completedAt?: string;
}

// ── Step metadata for display ──
const STEP_META: Record<string, { label: string; icon: React.ElementType; group: string }> = {
  authenticating: { label: "Authenticating with GitHub", icon: Server, group: "Setup" },
  checking_cap: { label: "Checking Usage Limits", icon: CheckCircle2, group: "Setup" },
  fetching_pr: { label: "Fetching PR Diff", icon: GitBranch, group: "Setup" },
  sandbox_booting: { label: "Booting E2B MicroVM", icon: Cpu, group: "Sandbox" },
  sandbox_cloning: { label: "Cloning Repository", icon: GitBranch, group: "Sandbox" },
  sandbox_installing: { label: "Installing Dependencies", icon: Package, group: "Sandbox" },
  sandbox_testing: { label: "Executing Tests", icon: FlaskConical, group: "Sandbox" },
  sandbox_complete: { label: "Sandbox Complete", icon: CheckCircle2, group: "Sandbox" },
  sandbox_skipped: { label: "Sandbox Skipped", icon: SkipForward, group: "Sandbox" },
  sandbox_failed: { label: "Sandbox Failed", icon: XCircle, group: "Sandbox" },
  llm_routing: { label: "AI Model Routing", icon: Brain, group: "Analysis" },
  llm_failover: { label: "Failover Activated", icon: ArrowRightLeft, group: "Analysis" },
  llm_complete: { label: "Analysis Complete", icon: Zap, group: "Analysis" },
  posting_review: { label: "Posting to GitHub", icon: GitBranch, group: "Delivery" },
  creating_check: { label: "Creating Check Run", icon: CheckCircle2, group: "Delivery" },
  complete: { label: "Pipeline Complete", icon: CheckCircle2, group: "Done" },
  failed: { label: "Pipeline Failed", icon: XCircle, group: "Done" },
};

function getStatusColor(status: StepStatus): string {
  switch (status) {
    case "active": return "text-accent-blue";
    case "complete": return "text-primary";
    case "failed": return "text-error";
    case "skipped": return "text-fg-subtle";
    default: return "text-fg-muted";
  }
}

function getStatusGlow(status: StepStatus): string {
  switch (status) {
    case "active": return "shadow-[0_0_20px_rgba(88,166,255,0.4)]";
    case "complete": return "shadow-[0_0_12px_rgba(123,219,128,0.3)]";
    case "failed": return "shadow-[0_0_12px_rgba(248,81,73,0.3)]";
    default: return "";
  }
}

function getBorderGlow(status: StepStatus): string {
  switch (status) {
    case "active": return "border-accent-blue/50";
    case "complete": return "border-primary/30";
    case "failed": return "border-error/30";
    default: return "border-border-default";
  }
}

// ── Pulsing dot for active steps ──
function PulsingDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`} />
    </span>
  );
}

// ── Timeline Step Node ──
function TimelineStep({ entry, isLast }: { entry: PipelineStepEntry; isLast: boolean }) {
  const meta = STEP_META[entry.step] || { label: entry.step, icon: Clock, group: "Unknown" };
  const Icon = meta.icon;
  const timeStr = new Date(entry.timestamp).toLocaleTimeString();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex gap-4 relative"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[18px] top-10 bottom-0 w-px bg-border-default" />
      )}

      {/* Node */}
      <div className="flex-shrink-0 mt-1 relative z-10">
        {entry.status === "active" ? (
          <div className={`w-9 h-9 rounded-xl bg-accent-blue/10 border border-accent-blue/40 flex items-center justify-center ${getStatusGlow("active")}`}>
            <PulsingDot color="bg-accent-blue" />
          </div>
        ) : (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${getBorderGlow(entry.status)} ${
            entry.status === "complete" ? "bg-primary/10" :
            entry.status === "failed" ? "bg-error/10" :
            "bg-surface-container"
          }`}>
            <Icon size={16} className={getStatusColor(entry.status)} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-title-card-sm text-title-card-sm ${
            entry.status === "active" ? "text-accent-blue" :
            entry.status === "complete" ? "text-fg-default" :
            entry.status === "failed" ? "text-error" :
            "text-fg-subtle"
          }`}>
            {meta.label}
          </span>

          {entry.provider && (
            <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple-light border border-accent-purple/30">
              {entry.provider}
            </span>
          )}

          {entry.failoverFrom && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-badge-mono text-badge-mono px-2 py-0.5 rounded-full bg-accent-amber/15 text-accent-amber border border-accent-amber/30"
            >
              ↩ from {entry.failoverFrom}
            </motion.span>
          )}
        </div>

        {entry.detail && (
          <p className="font-body-sm text-body-sm text-fg-muted mt-1">{entry.detail}</p>
        )}

        <span className="font-code-gutter text-code-gutter text-fg-subtle mt-1 inline-block">
          {timeStr}
        </span>
      </div>
    </motion.div>
  );
}

// ── Sandbox Terminal Output ──
function SandboxTerminal({ result }: { result: SandboxResultSummary }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border ${result.success ? "border-primary/20" : "border-error/20"} bg-canvas-inset overflow-hidden`}
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container/50 border-b border-border-default">
        <div className="flex items-center gap-3">
          <Terminal size={16} className={result.success ? "text-primary" : "text-error"} />
          <span className="font-title-card-sm text-title-card-sm text-fg-default">
            Sandbox Execution
          </span>
          <span className={`font-badge-mono text-badge-mono px-2 py-0.5 rounded-full ${
            result.success
              ? "bg-diff-addition-line text-diff-addition-text"
              : "bg-diff-deletion-line text-diff-deletion-text"
          }`}>
            {result.success ? "PASSED" : `EXIT ${result.exitCode}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-code-gutter text-code-gutter text-fg-subtle">
            {(result.durationMs / 1000).toFixed(1)}s
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-fg-muted hover:text-fg-default transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 max-h-80 overflow-y-auto">
              {result.stdout && (
                <div className="mb-3">
                  <span className="font-badge-mono text-badge-mono text-fg-subtle block mb-1">STDOUT</span>
                  <pre className="font-code-diff text-code-diff text-fg-default whitespace-pre-wrap break-all bg-surface-container-lowest rounded-lg p-3 border border-border-muted">
                    {result.stdout}
                  </pre>
                </div>
              )}
              {result.stderr && (
                <div>
                  <span className="font-badge-mono text-badge-mono text-error block mb-1">STDERR</span>
                  <pre className="font-code-diff text-code-diff text-diff-deletion-text whitespace-pre-wrap break-all bg-diff-deletion-line/30 rounded-lg p-3 border border-error/20">
                    {result.stderr}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── AI Summary Card ──
function AISummaryCard({ summary, provider }: { summary: string; provider?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl border border-primary/30 bg-gradient-to-br from-surface-container/80 to-canvas-subtle/80 backdrop-blur-sm p-6 shadow-[0_0_30px_rgba(123,219,128,0.08)]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(123,219,128,0.2)]">
          <Brain size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-title-card text-title-card text-fg-default">AI Review Summary</h3>
          {provider && (
            <span className="font-badge-mono text-badge-mono text-fg-muted">via {provider}</span>
          )}
        </div>
      </div>
      <p className="font-body-base text-body-base text-fg-default leading-relaxed whitespace-pre-wrap">
        {summary}
      </p>
    </motion.div>
  );
}

// ── Empty State ──
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 rounded-2xl bg-surface-container border border-border-default flex items-center justify-center shadow-lg"
      >
        <Cpu size={36} className="text-fg-muted" />
      </motion.div>
      <div className="text-center max-w-md">
        <h2 className="font-title-card text-title-card text-fg-default mb-2">
          No Active Pipeline
        </h2>
        <p className="font-body-base text-body-base text-fg-muted">
          Open a pull request on a connected repository to trigger the review pipeline.
          The live visualization will appear here automatically.
        </p>
      </div>
    </div>
  );
}

// ── Main Dashboard Component ──
export default function LiveReviewDashboard() {
  const [pipeline, setPipeline] = useState<PipelineRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews/latest/pipeline");
      if (res.status === 404) {
        setPipeline(null);
        setError(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch pipeline");
      const data = await res.json();
      setPipeline(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchPipeline();

    const interval = setInterval(() => {
      fetchPipeline();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchPipeline]);

  const isActive = pipeline && !pipeline.completedAt;

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[960px] w-full mx-auto px-space-6 py-space-8 flex flex-col gap-space-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-4 pb-space-4 border-b border-border-default">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-section text-headline-section text-fg-default tracking-tight">
                Live Review
              </h1>
              {isActive && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="font-badge-mono text-badge-mono px-2.5 py-1 rounded-full bg-accent-blue/15 text-accent-blue border border-accent-blue/30"
                >
                  ● LIVE
                </motion.span>
              )}
            </div>
            <p className="font-body-base text-body-base text-fg-muted mt-1">
              {pipeline
                ? `${pipeline.repoFullName} #${pipeline.prNumber}`
                : "Real-time view of the AI review pipeline"}
            </p>
          </div>

          <button
            onClick={fetchPipeline}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-default hover:bg-surface-container text-fg-default font-label-ui text-label-ui transition-colors self-start"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-surface-container" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-48 bg-surface-container rounded" />
                  <div className="h-3 w-32 bg-surface-container rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-error/30 bg-error/5">
            <AlertTriangle size={20} className="text-error" />
            <span className="font-body-base text-body-base text-error">{error}</span>
          </div>
        ) : !pipeline ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-space-6">
            {/* Pipeline Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-5 backdrop-blur-sm ${
                pipeline.completedAt
                  ? pipeline.currentStep === "failed"
                    ? "border-error/30 bg-error/5"
                    : "border-primary/30 bg-primary/5"
                  : "border-accent-blue/30 bg-accent-blue/5"
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <PulsingDot color="bg-accent-blue" />
                  ) : pipeline.currentStep === "failed" ? (
                    <XCircle size={20} className="text-error" />
                  ) : (
                    <CheckCircle2 size={20} className="text-primary" />
                  )}
                  <span className="font-title-card text-title-card text-fg-default">
                    {isActive
                      ? "Pipeline Running..."
                      : pipeline.currentStep === "failed"
                        ? "Pipeline Failed"
                        : "Pipeline Complete"}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-badge-mono text-badge-mono text-fg-muted">
                  <span>{pipeline.repoFullName}</span>
                  <span className="text-fg-subtle">·</span>
                  <span>PR #{pipeline.prNumber}</span>
                  {pipeline.completedAt && (
                    <>
                      <span className="text-fg-subtle">·</span>
                      <span>
                        {((new Date(pipeline.completedAt).getTime() - new Date(pipeline.startedAt).getTime()) / 1000).toFixed(1)}s total
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <div className="flex flex-col">
              <h2 className="font-title-card text-title-card text-fg-default mb-4 flex items-center gap-2">
                <Clock size={18} className="text-fg-muted" />
                Pipeline Timeline
              </h2>
              <AnimatePresence mode="popLayout">
                {pipeline.steps.map((entry, idx) => (
                  <TimelineStep
                    key={`${entry.step}-${entry.timestamp}`}
                    entry={entry}
                    isLast={idx === pipeline.steps.length - 1}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Sandbox Output */}
            {pipeline.sandboxResult && (
              <div className="flex flex-col gap-3">
                <h2 className="font-title-card text-title-card text-fg-default flex items-center gap-2">
                  <FlaskConical size={18} className="text-fg-muted" />
                  Sandbox Results
                </h2>
                <SandboxTerminal result={pipeline.sandboxResult} />
              </div>
            )}

            {/* AI Summary */}
            {pipeline.aiSummary && (
              <AISummaryCard summary={pipeline.aiSummary} provider={pipeline.provider} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
