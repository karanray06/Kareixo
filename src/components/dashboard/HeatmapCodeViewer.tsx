"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Shield,
  Zap,
  Bug,
  AlertTriangle,
  ChevronRight,
  X,
  Loader2,
  Upload,
} from "lucide-react";

// ── Types ──
interface HeatmapLine {
  line: number;
  defectProbability: number;
  severity: "critical" | "high" | "medium" | "low";
  reason: string;
  category: string;
}

interface HeatmapResult {
  lines: HeatmapLine[];
  overallRisk: number;
  summary: string;
  provider?: string;
}

// ── Color helpers ──
function getProbabilityColor(prob: number): string {
  if (prob >= 0.8) return "rgba(248, 81, 73, 0.25)";
  if (prob >= 0.5) return "rgba(210, 153, 34, 0.18)";
  if (prob >= 0.3) return "rgba(210, 153, 34, 0.08)";
  return "transparent";
}

function getProbabilityBorder(prob: number): string {
  if (prob >= 0.8) return "border-l-4 border-l-error";
  if (prob >= 0.5) return "border-l-4 border-l-accent-amber";
  if (prob >= 0.3) return "border-l-2 border-l-accent-amber/40";
  return "border-l-2 border-l-transparent";
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical": return <Flame size={14} className="text-error" />;
    case "high": return <AlertTriangle size={14} className="text-diff-deletion-text" />;
    case "medium": return <Bug size={14} className="text-accent-amber" />;
    case "low": return <Shield size={14} className="text-fg-subtle" />;
    default: return <Zap size={14} className="text-fg-subtle" />;
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    logic: "Logic Error",
    security: "Security",
    performance: "Performance",
    race_condition: "Race Condition",
    null_reference: "Null Reference",
    type_error: "Type Error",
    memory_leak: "Memory Leak",
    error_handling: "Error Handling",
    style: "Code Style",
  };
  return labels[category] || category;
}

// ── Risk Gauge ──
function RiskGauge({ risk }: { risk: number }) {
  const percentage = Math.round(risk * 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (risk * circumference);

  const color = risk >= 0.7 ? "text-error" : risk >= 0.4 ? "text-accent-amber" : "text-primary";
  const strokeColor = risk >= 0.7 ? "#f85149" : risk >= 0.4 ? "#d29922" : "#7bdb80";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border-default)" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`font-headline-section text-[28px] font-bold ${color}`}>
            {percentage}
          </span>
          <span className="font-badge-mono text-badge-mono text-fg-subtle">RISK</span>
        </div>
      </div>
    </div>
  );
}

// ── Tooltip ──
function DefectTooltip({
  line,
  onClose,
}: {
  line: HeatmapLine;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute left-16 top-0 z-50 w-80 rounded-xl border border-border-default bg-canvas-subtle/95 backdrop-blur-md shadow-2xl p-4"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {getSeverityIcon(line.severity)}
          <span className="font-title-card-sm text-title-card-sm text-fg-default capitalize">
            {line.severity} Risk
          </span>
          <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded-full bg-surface-container text-fg-muted">
            {Math.round(line.defectProbability * 100)}%
          </span>
        </div>
        <button onClick={onClose} className="text-fg-muted hover:text-fg-default transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-accent-purple/15 text-accent-purple-light border border-accent-purple/20">
          {getCategoryLabel(line.category)}
        </span>
        <span className="font-code-gutter text-code-gutter text-fg-subtle">
          Line {line.line}
        </span>
      </div>

      <p className="font-body-sm text-body-sm text-fg-default leading-relaxed">
        {line.reason}
      </p>
    </motion.div>
  );
}

// ── Main Component ──
export default function HeatmapCodeViewer() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [result, setResult] = useState<HeatmapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const analyze = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedLine(null);

    try {
      const res = await fetch("/api/heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code, language]);

  // Build line → defect map
  const lineMap = useMemo(() => {
    if (!result) return new Map<number, HeatmapLine>();
    return new Map(result.lines.map((l) => [l.line, l]));
  }, [result]);

  const codeLines = useMemo(() => code.split("\n"), [code]);

  return (
    <div className="flex flex-col gap-space-6">
      {/* Input Section */}
      {!result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-container border border-border-default text-fg-default font-label-ui text-label-ui focus:outline-none focus:border-accent-blue"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="tsx">TSX</option>
              <option value="jsx">JSX</option>
            </select>

            <button
              onClick={analyze}
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui font-semibold hover:bg-accent-green-hover transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Flame size={16} />
              )}
              {loading ? "Analyzing..." : "Generate Heatmap"}
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={16}
            className="w-full rounded-xl bg-canvas-inset border border-border-default p-4 font-code-diff text-code-diff text-fg-default placeholder:text-fg-subtle focus:outline-none focus:border-accent-blue resize-y"
          />
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-error/30 bg-error/5">
          <AlertTriangle size={20} className="text-error" />
          <span className="font-body-base text-body-base text-error">{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-space-6"
        >
          {/* Summary bar */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <RiskGauge risk={result.overallRisk} />

            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-title-card text-title-card text-fg-default">
                  Defect Heatmap
                </h2>
                <button
                  onClick={() => { setResult(null); setSelectedLine(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default hover:bg-surface-container text-fg-default font-label-ui text-label-ui transition-colors"
                >
                  <Upload size={14} />
                  New Analysis
                </button>
              </div>
              <p className="font-body-base text-body-base text-fg-muted">{result.summary}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 flex-wrap font-badge-mono text-badge-mono">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error/10 text-error border border-error/20">
                  <Flame size={12} /> {result.lines.filter((l) => l.defectProbability >= 0.8).length} critical
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                  <AlertTriangle size={12} /> {result.lines.filter((l) => l.defectProbability >= 0.5 && l.defectProbability < 0.8).length} warnings
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-fg-muted border border-border-default">
                  {codeLines.length} lines analyzed
                </span>
                {result.provider && (
                  <span className="px-2.5 py-1 rounded-full bg-accent-purple/10 text-accent-purple-light border border-accent-purple/20">
                    via {result.provider}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Code viewer with heatmap overlay */}
          <div className="rounded-2xl border border-border-default bg-canvas-inset overflow-hidden">
            {/* File header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container/50 border-b border-border-default">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-error/60" />
                <span className="w-3 h-3 rounded-full bg-accent-amber/60" />
                <span className="w-3 h-3 rounded-full bg-primary/60" />
              </div>
              <span className="font-code-diff text-code-diff text-fg-muted ml-2">{language}</span>
            </div>

            {/* Code lines */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {codeLines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const defect = lineMap.get(lineNum);
                    const isSelected = selectedLine === lineNum;

                    return (
                      <tr
                        key={idx}
                        className={`group relative cursor-pointer transition-colors ${
                          defect ? "hover:brightness-110" : "hover:bg-surface-container/30"
                        }`}
                        style={{
                          backgroundColor: defect
                            ? getProbabilityColor(defect.defectProbability)
                            : undefined,
                        }}
                        onClick={() => {
                          if (defect) setSelectedLine(isSelected ? null : lineNum);
                        }}
                      >
                        {/* Gutter */}
                        <td className={`w-12 text-right pr-3 pl-3 select-none font-code-gutter text-code-gutter ${
                          defect ? "text-fg-muted" : "text-fg-subtle"
                        }`}>
                          {lineNum}
                        </td>

                        {/* Severity indicator */}
                        <td className={`w-1 ${defect ? getProbabilityBorder(defect.defectProbability) : ""}`} />

                        {/* Probability badge */}
                        <td className="w-12 text-center">
                          {defect && (
                            <motion.span
                              animate={defect.defectProbability >= 0.8 ? {
                                opacity: [0.7, 1, 0.7],
                              } : {}}
                              transition={defect.defectProbability >= 0.8 ? {
                                duration: 2,
                                repeat: Infinity,
                              } : {}}
                              className={`inline-flex items-center justify-center w-8 font-badge-mono text-[10px] font-semibold rounded ${
                                defect.defectProbability >= 0.8
                                  ? "text-error"
                                  : defect.defectProbability >= 0.5
                                    ? "text-accent-amber"
                                    : "text-fg-subtle"
                              }`}
                            >
                              {Math.round(defect.defectProbability * 100)}
                            </motion.span>
                          )}
                        </td>

                        {/* Code */}
                        <td className="py-0 pr-4">
                          <pre className="font-code-diff text-code-diff text-fg-default whitespace-pre">
                            {line || " "}
                          </pre>
                        </td>

                        {/* Inline icon */}
                        <td className="w-8 pr-2">
                          {defect && (
                            <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                              <ChevronRight size={14} className={
                                defect.defectProbability >= 0.8 ? "text-error" : "text-accent-amber"
                              } />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected line tooltip (overlay) */}
          <AnimatePresence>
            {selectedLine && lineMap.has(selectedLine) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="rounded-xl border border-border-default bg-canvas-subtle/95 backdrop-blur-md shadow-2xl p-5"
              >
                {(() => {
                  const defect = lineMap.get(selectedLine)!;
                  return (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(defect.severity)}
                          <span className="font-title-card text-title-card text-fg-default">
                            Line {defect.line}
                          </span>
                          <span className="font-badge-mono text-badge-mono px-2.5 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple-light border border-accent-purple/20">
                            {getCategoryLabel(defect.category)}
                          </span>
                          <span className={`font-badge-mono text-badge-mono px-2.5 py-0.5 rounded-full ${
                            defect.defectProbability >= 0.8
                              ? "bg-error/15 text-error border border-error/30"
                              : "bg-accent-amber/15 text-accent-amber border border-accent-amber/30"
                          }`}>
                            {Math.round(defect.defectProbability * 100)}% probability
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedLine(null)}
                          className="text-fg-muted hover:text-fg-default transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="font-body-base text-body-base text-fg-default">
                        {defect.reason}
                      </p>
                      <pre className="font-code-diff text-code-diff text-fg-muted bg-surface-container-lowest rounded-lg p-3 border border-border-muted">
                        {codeLines[selectedLine - 1]}
                      </pre>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
