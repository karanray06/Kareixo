"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface RepoDetailData {
  repository: {
    id: string;
    fullName: string;
    enabledCategories: string[];
    preferredTier: string;
    createdAt: string;
  };
  stats: {
    totalReviews: number;
    passedClean: number;
    activeFindings: number;
  };
  recentReviews: {
    id: string;
    prNumber: number;
    status: string;
    summary: string | null;
    findingCount: number;
    createdAt: string;
  }[];
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RepositoryDetails({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = use(params);
  const [data, setData] = useState<RepoDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescanning, setRescanning] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/repositories/${repoId}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [repoId]);

  const handleRescan = async () => {
    setRescanning(true);
    try {
      await fetch("/api/repositories/sync", { method: "POST" });
    } finally {
      setRescanning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <div className="w-full px-gutter py-space-md flex flex-col gap-space-lg max-w-[1720px] mx-auto">
          <div className="bg-canvas-subtle p-space-md rounded-xl shadow-sm animate-pulse">
            <div className="h-8 w-96 bg-surface-container rounded mb-4" />
            <div className="h-4 w-64 bg-surface-container rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.repository) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-[40px] text-fg-muted">error</span>
        <p className="font-body-base text-body-base text-fg-muted">Repository not found</p>
        <Link
          href="/dashboard"
          className="font-label-ui text-label-ui text-accent-blue hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const repo = data.repository;
  const stats = data.stats;
  const recentReviews = data.recentReviews || [];
  const owner = repo.fullName.split("/")[0];
  const repoName = repo.fullName.split("/")[1];
  const passRate =
    stats.totalReviews > 0
      ? Math.round((stats.passedClean / stats.totalReviews) * 100)
      : 0;

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-gutter py-space-md flex flex-col gap-space-lg max-w-[1720px] mx-auto">
        {/* Repository Header */}
        <div className="flex flex-col gap-space-sm bg-canvas-subtle p-space-md rounded-xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="material-symbols-outlined text-accent-blue text-[24px]">
                account_tree
              </span>
              <span className="font-headline-section text-headline-section text-fg-muted font-medium">
                {owner}
              </span>
              <span className="text-fg-subtle font-headline-section text-headline-section">/</span>
              <span className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight">
                {repoName}
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <a
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-fg-default hover:bg-surface-bright font-title-card-sm text-title-card-sm transition-colors shadow-sm"
                href={`https://github.com/${repo.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[18px] text-fg-muted">
                  open_in_new
                </span>
                <span>GitHub</span>
              </a>
              <button
                onClick={handleRescan}
                disabled={rescanning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-fg-default hover:bg-surface-bright font-title-card-sm text-title-card-sm transition-colors shadow-sm disabled:opacity-60"
              >
                <span
                  className={`material-symbols-outlined text-[18px] text-accent-blue ${rescanning ? "animate-spin" : ""}`}
                >
                  sync
                </span>
                <span>{rescanning ? "Syncing..." : "Sync"}</span>
              </button>
            </div>
          </div>

          {/* Repository metadata */}
          <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-xs text-body-sm font-body-sm text-fg-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-green-emphasis" />
              <span>Webhook Active</span>
            </div>
            <span className="text-fg-subtle">•</span>
            <span>
              Tier: <span className="text-fg-default font-medium">{repo.preferredTier}</span>
            </span>
            <span className="text-fg-subtle">•</span>
            <span>
              Categories:{" "}
              <span className="text-fg-default">
                {repo.enabledCategories?.length > 0
                  ? repo.enabledCategories.join(", ")
                  : "all"}
              </span>
            </span>
          </div>
        </div>

        {/* Stats + Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left: Stats + Review List */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            {/* Stats cards row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <div className="bg-canvas-subtle p-space-md rounded-lg shadow-sm">
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-fg-muted">Total Reviews</span>
                  <span className="font-badge-mono text-badge-mono text-fg-default">
                    {stats.totalReviews}
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-accent-purple h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
              <div className="bg-canvas-subtle p-space-md rounded-lg shadow-sm">
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-fg-muted">Passed Clean</span>
                  <span className="font-badge-mono text-badge-mono text-diff-addition-text">
                    {passRate}%
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-accent-green-emphasis h-full rounded-full"
                    style={{ width: `${passRate}%` }}
                  />
                </div>
              </div>
              <div className="bg-canvas-subtle p-space-md rounded-lg shadow-sm">
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-fg-muted">Active Findings</span>
                  <span className="font-badge-mono text-badge-mono text-accent-amber">
                    {stats.activeFindings}
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-accent-amber h-full rounded-full"
                    style={{
                      width: `${stats.totalReviews > 0 ? Math.min(100, Math.round((stats.activeFindings / stats.totalReviews) * 100)) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-canvas-subtle rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="px-space-md py-space-sm bg-surface-container flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-fg-muted text-[20px]">
                    rate_review
                  </span>
                  <span className="font-title-card text-title-card text-fg-default font-semibold">
                    Recent Reviews
                  </span>
                  <span className="font-badge-mono text-badge-mono bg-canvas-inset px-2 py-0.5 rounded text-fg-muted">
                    {recentReviews.length}
                  </span>
                </div>
              </div>

              <div className="p-space-md flex flex-col gap-space-sm">
                {recentReviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <span className="material-symbols-outlined text-[28px] text-fg-muted">
                      rate_review
                    </span>
                    <p className="font-body-sm text-body-sm text-fg-muted">
                      No reviews yet for this repository.
                    </p>
                  </div>
                ) : (
                  recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-canvas-default p-space-md rounded-lg flex flex-col gap-space-sm shadow-sm hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-sm">
                          <span className="material-symbols-outlined text-accent-purple text-[18px]">
                            merge
                          </span>
                          <span className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                            PR #{review.prNumber}
                          </span>
                          {review.status === "completed" && review.findingCount === 0 ? (
                            <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-diff-addition-line text-diff-addition-text">
                              Clean
                            </span>
                          ) : review.status === "completed" ? (
                            <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-surface-container text-accent-amber">
                              {review.findingCount} findings
                            </span>
                          ) : review.status === "failed" ? (
                            <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-diff-deletion-line text-diff-deletion-text">
                              Failed
                            </span>
                          ) : (
                            <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-surface-container text-fg-muted">
                              Pending
                            </span>
                          )}
                        </div>
                        <span className="font-code-gutter text-code-gutter text-fg-muted">
                          {timeAgo(review.createdAt)}
                        </span>
                      </div>
                      {review.summary && (
                        <p className="font-body-sm text-body-sm text-fg-muted line-clamp-2 pl-7">
                          {review.summary}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Review Agent Info */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-surface-container p-space-md rounded-xl shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-accent-purple">
                    smart_toy
                  </span>
                  <span className="font-title-card text-title-card text-fg-default font-semibold">
                    Review Agent
                  </span>
                </div>
                <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-surface-container-high text-fg-muted">
                  Gemini
                </span>
              </div>

              <div className="p-space-sm bg-canvas-inset rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-fg-muted">Status</span>
                  <span className="inline-flex items-center gap-1 font-badge-mono text-badge-mono text-diff-addition-text font-medium">
                    <span className="w-2 h-2 rounded-full bg-accent-green-emphasis" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-fg-muted">Reviews Run</span>
                  <span className="font-badge-mono text-badge-mono text-fg-default">
                    {stats.totalReviews}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-fg-muted">Tier</span>
                  <span className="font-badge-mono text-badge-mono text-fg-default capitalize">
                    {repo.preferredTier}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs">
                <span className="font-label-ui text-label-ui text-fg-muted font-medium uppercase tracking-wider">
                  Finding Distribution
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-canvas-inset rounded-lg flex flex-col items-center">
                    <span className="font-title-card text-title-card text-diff-addition-text font-bold">
                      {stats.passedClean}
                    </span>
                    <span className="font-badge-mono text-badge-mono text-fg-subtle">Clean</span>
                  </div>
                  <div className="p-2 bg-canvas-inset rounded-lg flex flex-col items-center">
                    <span className="font-title-card text-title-card text-accent-amber font-bold">
                      {stats.activeFindings}
                    </span>
                    <span className="font-badge-mono text-badge-mono text-fg-subtle">
                      Findings
                    </span>
                  </div>
                  <div className="p-2 bg-canvas-inset rounded-lg flex flex-col items-center">
                    <span className="font-title-card text-title-card text-fg-muted font-bold">
                      {stats.totalReviews - stats.passedClean}
                    </span>
                    <span className="font-badge-mono text-badge-mono text-fg-subtle">
                      With Issues
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-space-sm pt-space-xs">
                <a
                  href={`https://github.com/${repo.fullName}/pulls`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container hover:bg-accent-green-hover text-on-primary font-title-card-sm text-title-card-sm font-semibold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  View Pull Requests on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
