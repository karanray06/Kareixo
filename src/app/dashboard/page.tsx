"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, Activity, TerminalSquare, AlertCircle } from "lucide-react";

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
    <div className="glass-card p-6 flex flex-col justify-between animate-pulse">
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
              <ShieldCheck className="text-fg-muted" size={40} />
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
                className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                href="https://github.com/apps/kareixo-reviewer/installations/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Plus size={18} />
                <span>Connect a Repository</span>
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
              <div className="glass-card p-6 flex flex-col gap-2">
                <span className="font-label-ui text-label-ui text-fg-muted uppercase tracking-wider">
                  PRs Analyzed
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-fg-default font-code-diff">
                    {totalReviews}
                  </span>
                  {totalReviews > 0 && (
                    <span className="flex items-center gap-1 font-badge-mono text-[11px] text-accent-green-emphasis bg-accent-green-emphasis/10 px-1.5 py-0.5 rounded">
                      <TrendingUp size={12} />
                      +12%
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-fg-muted font-body-sm text-body-sm mt-2">
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
              <div className="glass-card p-6 flex flex-col gap-2">
                <span className="font-label-ui text-label-ui text-fg-muted uppercase tracking-wider">
                  Passed Clean
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-fg-default font-code-diff">
                    {passedClean}
                  </span>
                </div>
                <div className="flex items-center justify-between text-fg-muted font-body-sm text-body-sm mt-2">
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
              <div className="glass-card p-6 flex flex-col gap-2">
                <span className="font-label-ui text-label-ui text-fg-muted uppercase tracking-wider">
                  Active Findings
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-fg-default font-code-diff">
                    {activeFindings}
                  </span>
                  {activeFindings > 0 && (
                    <span className="flex items-center gap-1 font-badge-mono text-[11px] text-accent-amber bg-accent-amber/10 px-1.5 py-0.5 rounded">
                      Needs review
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-fg-muted font-body-sm text-body-sm mt-2">
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
              <div className="glass-card p-6 flex flex-col gap-2">
                <span className="font-label-ui text-label-ui text-fg-muted uppercase tracking-wider">
                  Repositories
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-fg-default font-code-diff">
                    {repoCount}
                  </span>
                  <span className="font-badge-mono text-[11px] text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded">
                    connected
                  </span>
                </div>
                <div className="flex items-center justify-between text-fg-muted font-body-sm text-body-sm mt-2">
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
        <section className="glass-card p-space-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md relative overflow-hidden">
          <div className="flex items-start gap-space-md z-10">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0 text-accent-blue shadow-inner">
              <ShieldCheck size={24} />
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
          <div className="flex flex-wrap items-center gap-space-sm z-10">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container text-fg-default font-badge-mono text-badge-mono">
              <CheckCircle2 size={15} className="text-diff-addition-text" />
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container text-fg-default font-badge-mono text-badge-mono">
              <Activity size={15} className="text-accent-amber" />
              <span>Unverified</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container text-fg-default font-badge-mono text-badge-mono">
              <AlertCircle size={15} className="text-diff-deletion-text" />
              <span>Rejected</span>
            </div>
          </div>
        </section>

        {/* Developer Tools / Quick Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-4">
          <div className="glass-card p-6 flex flex-col gap-4">
            <h2 className="font-title-card text-title-card text-fg-default font-semibold mb-2">
              Developer Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/codechat"
                className="flex items-start gap-3 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <TerminalSquare size={20} className="text-accent-purple" />
                </div>
                <div>
                  <h3 className="font-label-ui text-label-ui text-fg-default font-medium">
                    CodeChat
                  </h3>
                  <p className="font-body-sm text-body-sm text-fg-muted line-clamp-2 mt-1">
                    Chat with your codebase and propose PRs.
                  </p>
                </div>
              </Link>

              <Link
                href="/incident"
                className="flex items-start gap-3 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-red/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Activity size={20} className="text-accent-red" />
                </div>
                <div>
                  <h3 className="font-label-ui text-label-ui text-fg-default font-medium">
                    Incident Tracer
                  </h3>
                  <p className="font-body-sm text-body-sm text-fg-muted line-clamp-2 mt-1">
                    Paste a stack trace to find the root cause.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left: Repositories */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
            {/* Connected Repositories */}
            <div className="glass-card rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="p-space-md flex items-center justify-between bg-surface-container">
                <div className="flex items-center gap-space-sm">
                  <ShieldCheck className="text-fg-muted" size={20} />
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
                  <Plus size={16} />
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
                        <ShieldCheck className="text-accent-blue" size={22} />
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
            <div className="glass-card rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="p-space-md bg-surface-container flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Activity className="text-fg-muted" size={20} />
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
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center border border-dashed border-border-default rounded-xl bg-surface-container/30">
                    <ShieldCheck size={24} className="text-fg-muted mb-2" />
                    <span className="font-body-sm text-body-sm text-fg-muted">
                      No reviews yet. Open a PR on a connected repo to trigger a review.
                    </span>
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
                              <CheckCircle2 size={13} />
                              Clean
                            </span>
                          ) : review.status === "completed" ? (
                            <span className="font-badge-mono text-badge-mono px-2 py-0.5 rounded bg-surface-container text-accent-amber flex items-center gap-1">
                              <AlertTriangle size={13} />
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
