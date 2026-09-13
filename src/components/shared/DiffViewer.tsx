"use client";

import { useState } from "react";
import { computeDiff, type DiffLine } from "@/lib/diff-utils";
import { FileDiff, GitMerge, AlertCircle } from "lucide-react";

interface DiffViewerProps {
  path: string;
  oldContent: string;
  newContent: string;
  sha: string | null;
  explanation: string;
  repoFullName: string;
  onApply: (result: { prUrl: string; prNumber: number; branchName: string }) => void;
  onDiscard: () => void;
}

export default function DiffViewer({
  path,
  oldContent,
  newContent,
  sha,
  explanation,
  repoFullName,
  onApply,
  onDiscard,
}: DiffViewerProps) {
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const diff = computeDiff(oldContent, newContent);

  // Count additions and deletions
  const additions = diff.filter((l) => l.type === "add").length;
  const deletions = diff.filter((l) => l.type === "remove").length;

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    try {
      const res = await fetch("/api/codechat/apply-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoFullName,
          path,
          newContent,
          baseSha: sha,
          explanation,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed (${res.status})`);
      }

      const result = await res.json();
      onApply(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  // Render line numbers for each side
  const renderLineNumber = (line: DiffLine) => {
    if (line.type === "same") {
      return (
        <>
          <span className="inline-block w-10 text-right pr-2 select-none text-fg-subtle opacity-60">
            {line.oldLineNumber}
          </span>
          <span className="inline-block w-10 text-right pr-2 select-none text-fg-subtle opacity-60">
            {line.newLineNumber}
          </span>
        </>
      );
    }
    if (line.type === "remove") {
      return (
        <>
          <span className="inline-block w-10 text-right pr-2 select-none text-diff-deletion-text opacity-80">
            {line.oldLineNumber}
          </span>
          <span className="inline-block w-10 text-right pr-2 select-none" />
        </>
      );
    }
    // add
    return (
      <>
        <span className="inline-block w-10 text-right pr-2 select-none" />
        <span className="inline-block w-10 text-right pr-2 select-none text-diff-addition-text opacity-80">
          {line.newLineNumber}
        </span>
      </>
    );
  };

  return (
    <div className="rounded-xl border border-border-default bg-canvas-subtle overflow-hidden my-2 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container border-b border-border-default">
        <div className="flex items-center gap-3 min-w-0">
          <FileDiff size={18} className="text-accent-purple" />
          <span className="font-code-diff text-code-diff text-fg-default font-medium truncate">
            {path}
          </span>
          <span className="flex items-center gap-1.5 font-badge-mono text-badge-mono">
            <span className="text-diff-addition-text">+{additions}</span>
            <span className="text-diff-deletion-text">−{deletions}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDiscard}
            disabled={applying}
            className="px-3 py-1.5 rounded-lg font-label-ui text-label-ui text-fg-muted hover:text-fg-default hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            Discard
          </button>
          <button
            onClick={handleApply}
            disabled={applying}
            className="px-3 py-1.5 rounded-lg font-label-ui text-label-ui bg-accent-green-emphasis text-white hover:bg-accent-green-hover transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {applying ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating PR...
              </>
            ) : (
              <>
                <GitMerge size={16} />
                Apply & Create PR
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explanation */}
      <div className="px-4 py-2.5 bg-surface-container-low border-b border-border-default">
        <p className="font-body-sm text-body-sm text-fg-muted">
          {explanation}
        </p>
      </div>

      {/* Diff lines */}
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <pre className="font-code-diff text-code-diff leading-snug">
          {diff.map((line, i) => (
            <div
              key={i}
              className={`flex px-2 ${
                line.type === "add"
                  ? "bg-diff-addition-line"
                  : line.type === "remove"
                    ? "bg-diff-deletion-line"
                    : ""
              }`}
            >
              {renderLineNumber(line)}
              <span
                className={`inline-block w-5 text-center select-none flex-shrink-0 ${
                  line.type === "add"
                    ? "text-diff-addition-text"
                    : line.type === "remove"
                      ? "text-diff-deletion-text"
                      : "text-fg-subtle opacity-40"
                }`}
              >
                {line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}
              </span>
              <span
                className={`flex-1 ${
                  line.type === "add"
                    ? "text-diff-addition-text"
                    : line.type === "remove"
                      ? "text-diff-deletion-text"
                      : "text-fg-muted"
                }`}
              >
                {line.content}
              </span>
            </div>
          ))}
        </pre>
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-3 bg-diff-deletion-line border-t border-accent-red/20">
          <p className="font-body-sm text-body-sm text-diff-deletion-text flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
