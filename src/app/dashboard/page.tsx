"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface RepoData {
  id: string;
  fullName: string;
  enabledCategories: string[];
  preferredTier: string;
  createdAt: string;
}

interface ReviewData {
  id: string;
  repositoryId: string;
  prNumber: number;
  status: string;
  summary: string | null;
  findingCount: number;
  createdAt: string;
}

interface DashboardData {
  repositories: RepoData[];
  stats: {
    totalReviews: number;
    passedClean: number;
    activeFindings: number;
  };
  recentReviews: ReviewData[];
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

function SkeletonCard() {
  return (
    <div className="bg-canvas-subtle p-space-md rounded-lg shadow-sm flex flex-col justify-between animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-surface-container rounded" />
        <div className="h-5 w-5 bg-surface-container rounded" />
      </div>
      <div className="my-space-sm h-8 w-16 bg-surface-container rounded" />
      <div className="h-2 w-full bg-surface-container rounded" />
    </div>
  );
}

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState<"all" | "completed" | "pending">("all");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/repositories")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();

    const handleSyncComplete = () => fetchData();
    window.addEventListener("kareixo:sync-complete", handleSyncComplete);
    return () => window.removeEventListener("kareixo:sync-complete", handleSyncComplete);
  }, []);

  const repoCount = data?.repositories?.length || 0;
  const totalReviews = data?.stats?.totalReviews || 0;
  const passedClean = data?.stats?.passedClean || 0;
  const passRate = totalReviews > 0 ? Math.round((passedClean / totalReviews) * 100) : 0;
  const activeFindings = data?.stats?.activeFindings || 0;

  // Empty state
  if (!loading && repoCount === 0) {
    return (
      <div className="flex flex-col w-full">
        <div className="w-full px-gutter py-space-lg max-w-[1560px] mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="w-20 h-20 rounded-2xl bg-surface-container border border-border-default flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-fg-muted">
                add_circle
              </span>
            </div>
            <div className="text-center max-w-md">
              <h2 className="font-title-card text-title-card text-fg-default mb-2">
                Connect your first repository
              </h2>
              <p className="font-body-base text-body-base text-fg-muted mb-6">
                Install the Kareixo GitHub App on your repositories to enable automatic
                pull request reviews with AI-powered code analysis.
              </p>
              <a
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container hover:bg-accent-green-hover text-on-primary-container font-label-ui text-label-ui shadow-sm transition-colors"
                href="https://github.com/apps/kareixo-reviewer/installations/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Install on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredReviews = (data?.recentReviews || []).filter((r) => {
    if (feedFilter === "all") return true;
    if (feedFilter === "completed") return r.status === "completed";
    return r.status === "pending" || r.status === "failed";
  });

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-gutter py-space-lg max-w-[1560px] mx-auto flex flex-col gap-space-lg">
        {/* Top Telemetry Strip (4 Bento Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {/* Card 1: PRs Analyzed */}
              <div className="bg-canvas-subtle p-space-md rounded-lg shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-label-ui text-label-ui text-fg-muted uppercase tracking-wider">
                    PRs Analyzed
                  </span>
                  <span className="material-symbols-outlined text-accent-purple text-[20px]">
                    merge
                  </span>
                </div>
                <div className="my-space-sm flex items-baseline gap-space-sm">
                  <span className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight">
                    {totalReviews}
                  </span>
                </div>
                <div className="flex items-center justify-between text-fg-muted font-body-sm text-body-sm">
                  <span>Pass rate</span>
                  <span className="font-badge-mono text-badge-mono text-fg-default font-medium">
                    {passRate}%
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-accent-purple h-full rounded-full transition-all duration-500"
                    style={{ width: `${passRate}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Passed Clean */}
              <div className="bg-canvas-subtle p-space-md rounded-lg shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-label-ui text-label-ui text-fg-muted uppercase tracking-wider">
                    Passed Clean
                  </span>
                  <span className="material-symbols-outlined text-accent-green-hover text-[20px]">
                    verified
                  </span>
                </div>
                <div className="my-space-sm flex items-baseline gap-space-sm">
                  <span className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight">
                    {passedClean}
                  </span>
                  <span className="font-badge-mono text-badge-mono text-diff-addition-text bg-diff-addition-line px-1.5 py-0.5 rounded">
                    no issues
                  </span>
                </div>
                <div className="flex items-center justify-between text-fg-muted font-body-sm text-body-sm">
                  <span>Zero findings</span>
                  <span className="font-badge-mono text-badge-mono text-fg-default">
                    of {totalReviews} total
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-accent-green-emphasis h-full rounded-full transition-all duration-500"
                    style={{ width: `${passRate}%` }}
                  />
                </div>
              </div>

              {/* Card 3: Active Findings */}
              <div className="bg-canvas-subtle p-space-md rounded-lg shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-label-ui text-label-ui text-fg-muted uppercase tracking-wider">
                    Active Findings
                  </span>
                  <span className="material-symbols-outlined text-accent-amber text-[20px]">
                    hourglass_top
                  </span>
                </div>
                <div className="my-space-sm flex items-baseline gap-space-sm">
                  <span className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight">
                    {activeFindings}
                  </span>
                  <span className="font-badge-mono text-badge-mono text-accent-amber bg-surface-container px-1.5 py-0.5 rounded">
                    pending review
                  </span>
                </div>
                <div className="flex items-center justify-between text-fg-muted font-body-sm text-body-sm">
                  <span>Across all repos</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-accent-amber h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${totalReviews > 0 ? Math.min(100, Math.round((activeFindings / totalReviews) * 100)) : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Card 4: Repositories */}
              <div className="bg-canvas-subtle p-space-md rounded-lg shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-label-ui text-label-ui text-fg-muted uppercase tracking-wider">
                    Repositories
                  </span>
                  <span className="material-symbols-outlined text-accent-blue text-[20px]">
                    source_environment
                  </span>
                </div>
                <div className="my-space-sm flex items-baseline gap-space-sm">
                  <span className="font-headline-section text-headline-section text-fg-default font-semibold tracking-tight">
                    {repoCount}
                  </span>
                  <span className="font-badge-mono text-badge-mono text-accent-blue bg-surface-container px-1.5 py-0.5 rounded">
                    connected
                  </span>
                </div>
                <div className="flex items-center justify-between text-fg-muted font-body-sm text-body-sm">
                  <span>Monitored repos</span>
                  <span className="font-badge-mono text-badge-mono text-fg-default">
                    webhook active
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-accent-blue h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </>
          )}
        </section>

        {/* Ground Truth System Banner */}
        <section className="bg-surface-container-low p-space-md rounded-lg shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md relative overflow-hidden">
          <div className="flex items-start gap-space-md z-10">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0 text-accent-blue shadow-inner">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-title-card text-title-card text-fg-default">
                  AI Code Review Engine
                </span>
                <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-surface-container-highest text-fg-muted">
                  GEMINI · AST ANALYSIS
                </span>
              </div>
              <p className="font-body-base text-body-base text-fg-muted mt-1 max-w-2xl">
                Every pull request is analyzed for security vulnerabilities, performance
                issues, and code quality. Findings are posted as inline comments on GitHub.
              </p>
            </div>
          </div>
          {/* Verification Status Legend */}
          <div className="flex flex-wrap items-center gap-space-sm z-10">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-diff-addition-line text-diff-addition-text font-badge-mono text-badge-mono shadow-sm">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container text-accent-amber font-badge-mono text-badge-mono shadow-sm">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              <span>Unverified</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-diff-deletion-line text-diff-deletion-text font-badge-mono text-badge-mono shadow-sm">
              <span className="material-symbols-outlined text-[15px]">cancel</span>
              <span>Rejected</span>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-surface-container-high/40 to-transparent pointer-events-none" />
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left: Repositories */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
            {/* Connected Repositories */}
            <div className="bg-canvas-subtle rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="p-space-md flex items-center justify-between bg-surface-container">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-fg-muted text-[20px]">
                    source_environment
                  </span>
                  <h2 className="font-title-card text-title-card text-fg-default font-semibold">
                    Connected Repositories
                  </h2>
                  <span className="font-badge-mono text-badge-mono bg-canvas-inset px-2 py-0.5 rounded text-fg-muted">
                    {loading ? "..." : repoCount} Repositories
                  </span>
                </div>
                <a
                  href="https://github.com/apps/kareixo-reviewer/installations/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-canvas-inset hover:bg-surface-container-high text-fg-default px-3 py-1.5 rounded-lg font-label-ui text-label-ui flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Repository</span>
                </a>
              </div>

              <div className="p-space-md flex flex-col gap-space-md">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-canvas-default rounded-lg p-space-md animate-pulse flex items-center gap-4"
                      >
                        <div className="w-6 h-6 bg-surface-container rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-48 bg-surface-container rounded" />
                          <div className="h-3 w-32 bg-surface-container rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  data?.repositories?.map((repo) => (
                    <Link
                      key={repo.id}
                      href={`/dashboard/${repo.id}`}
                      className="bg-canvas-default rounded-lg p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-accent-blue text-[22px]">
                          account_tree
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-space-xs">
                            <span className="font-title-card text-title-card text-fg-default hover:text-accent-blue font-semibold">
                              {repo.fullName}
                            </span>
                          </div>
                          <div className="flex items-center gap-space-xs text-fg-muted font-code-diff text-code-diff mt-0.5">
                            <span>
                              Categories:{" "}
                              {repo.enabledCategories?.length > 0
                                ? repo.enabledCategories.join(", ")
                                : "all"}
                            </span>
                            <span>•</span>
                            <span>
                              Tier: <span className="text-fg-default">{repo.preferredTier}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-sm">
                        <span className="font-badge-mono text-badge-mono px-2 py-1 rounded bg-diff-addition-line text-diff-addition-text flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-green-emphasis" />
                          Active
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Verification Feed */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg min-w-0">
            <div className="bg-canvas-subtle rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="p-space-md bg-surface-container flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-fg-muted text-[20px]">
                      rss_feed
                    </span>
                    <h3 className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                      Recent Reviews
                    </h3>
                  </div>
                  <span
                    className="w-2 h-2 rounded-full bg-accent-green-emphasis animate-pulse"
                    title="Webhook active"
                  />
                </div>
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-canvas-inset p-1 rounded-lg">
                  {(["all", "completed", "pending"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFeedFilter(filter)}
                      className={`flex-1 text-center py-1 rounded text-label-ui font-label-ui transition-all ${
                        feedFilter === filter
                          ? "text-fg-default bg-surface-container-high font-semibold"
                          : "text-fg-muted hover:text-fg-default"
                      }`}
                    >
                      {filter === "all"
                        ? `All (${data?.recentReviews?.length || 0})`
                        : filter === "completed"
                          ? `Completed`
                          : `Pending`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Items */}
              <div className="p-space-md flex flex-col gap-space-md">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-canvas-default p-space-md rounded-lg">
                        <div className="h-4 w-32 bg-surface-container rounded mb-2" />
                        <div className="h-3 w-48 bg-surface-container rounded" />
                      </div>
                    ))}
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <span className="material-symbols-outlined text-[28px] text-fg-muted">
                      rate_review
                    </span>
                    <p className="font-body-sm text-body-sm text-fg-muted">
                      No reviews yet. Open a PR on a connected repo to trigger a review.
                    </p>
                  </div>
                ) : (
                  filteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-canvas-default p-space-md rounded-lg flex flex-col gap-space-sm shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          {review.status === "completed" && review.findingCount === 0 ? (
                            <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-diff-addition-line text-diff-addition-text flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">
                                check_circle
                              </span>
                              Clean
                            </span>
                          ) : review.status === "completed" ? (
                            <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-surface-container text-accent-amber flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">
                                warning
                              </span>
                              {review.findingCount} findings
                            </span>
                          ) : review.status === "failed" ? (
                            <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-diff-deletion-line text-diff-deletion-text flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">
                                cancel
                              </span>
                              Failed
                            </span>
                          ) : (
                            <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-surface-container text-fg-muted flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">
                                schedule
                              </span>
                              Pending
                            </span>
                          )}
                          <span className="font-badge-mono text-badge-mono text-fg-subtle">
                            PR #{review.prNumber}
                          </span>
                        </div>
                        <span className="font-code-gutter text-code-gutter text-fg-muted">
                          {timeAgo(review.createdAt)}
                        </span>
                      </div>
                      {review.summary && (
                        <p className="font-body-sm text-body-sm text-fg-muted line-clamp-2">
                          {review.summary}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
