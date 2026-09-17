"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FolderX, FolderGit2, ChevronRight, GitFork, RefreshCw } from "lucide-react";

interface Repo {
  id: string;
  fullName: string;
  enabledCategories: string[];
  preferredTier: string;
  createdAt: string;
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

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/repositories")
      .then((res) => res.json())
      .then((json) => {
        setRepos(json.repositories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1280px] w-full mx-auto px-space-6 py-space-8 flex flex-col gap-space-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-4 pb-space-4 border-b border-border">
          <div>
            <h1 className="font-headline-section text-headline-section text-text-primary tracking-tight">
              Repositories
            </h1>
            <p className="font-body-base text-body-base text-text-secondary mt-1">
              {loading ? "Loading..." : `${repos.length} repositories connected to Kareixo`}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => {
                setLoading(true);
                fetch("/api/repositories/sync", { method: "POST" })
                  .then(() => fetch("/api/repositories"))
                  .then((res) => res.json())
                  .then((json) => {
                    setRepos(json.repositories || []);
                    setLoading(false);
                    window.dispatchEvent(new Event("kareixo:sync-complete"));
                  })
                  .catch(() => setLoading(false));
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-fg-default font-semibold text-sm transition-all"
            >
              <RefreshCw size={18} />
              <span>Sync Now</span>
            </button>
            <a
              className="btn btn-primary"
              href="https://github.com/apps/kareixo-reviewer/installations/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Plus size={18} />
              <span>Add Repository</span>
            </a>
          </div>
        </div>

        {/* Repo Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="glass-card p-4 flex flex-col gap-3 animate-pulse"
              >
                <div className="h-5 w-40 bg-surface-container rounded"></div>
                <div className="h-3 w-24 bg-surface-container rounded"></div>
                <div className="h-3 w-32 bg-surface-container rounded"></div>
              </div>
            ))}
          </div>
        ) : repos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="w-20 h-20 rounded-2xl bg-surface-container border border-border-default flex items-center justify-center shadow-lg">
              <FolderX size={40} className="text-fg-muted" />
            </div>
            <div className="text-center max-w-md">
              <h2 className="font-title-card text-title-card text-fg-default font-semibold mb-2">
                No repositories connected
              </h2>
              <p className="font-body-base text-body-base text-fg-muted mb-6">
                Install the Kareixo GitHub App on your repositories to start receiving automated
                code reviews.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  className="btn btn-primary"
                  href="https://github.com/apps/kareixo-reviewer/installations/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Plus size={18} />
                  <span>Install on GitHub</span>
                </a>
                <button
                  onClick={() => {
                    setLoading(true);
                    fetch("/api/repositories/sync", { method: "POST" })
                      .then(() => fetch("/api/repositories"))
                      .then((res) => res.json())
                      .then((json) => {
                        setRepos(json.repositories || []);
                        setLoading(false);
                        window.dispatchEvent(new Event("kareixo:sync-complete"));
                      })
                      .catch(() => setLoading(false));
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-fg-default font-semibold shadow-sm transition-all"
                >
                  <RefreshCw size={18} />
                  <span>Sync Existing</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-4">
            {repos.map((repo) => (
              <Link
                key={repo.id}
                href={`/dashboard/${repo.id}`}
                className="glass-card p-4 flex flex-col gap-3 group transition-all duration-300 hover:shadow-lg hover:border-fg-subtle cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FolderGit2 size={18} className="text-fg-subtle group-hover:text-accent-blue transition-colors" />
                      <span className="font-title-card-sm text-title-card-sm text-fg-default font-semibold truncate group-hover:text-accent-blue transition-colors">
                        {repo.fullName}
                      </span>
                    </div>
                    <span className="font-badge-mono text-[11px] text-fg-muted ml-[26px]">
                      Added {timeAgo(repo.createdAt)}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-fg-muted group-hover:text-fg-default transition-colors shrink-0" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {repo.enabledCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-1.5 py-0.5 rounded font-badge-mono text-[10px] bg-surface-subtle text-text-secondary border border-border capitalize"
                    >
                      {cat}
                    </span>
                  ))}
                  <span className="px-1.5 py-0.5 rounded font-badge-mono text-[10px] bg-accent-ai-subtle text-secondary border border-secondary/20">
                    {repo.preferredTier}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-badge-mono text-fg-muted pt-2 border-t border-border-default">
                  <GitFork size={12} />
                  <span>main</span>
                  <span className="text-fg-muted ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green-emphasis animate-pulse"></span>
                    Active
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
