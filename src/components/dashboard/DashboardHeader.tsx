"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  repos?: { fullName: string; defaultBranch?: string }[];
}

const NAV_LINKS = [
  { label: "Dashboard", path: "/dashboard", dataPath: "dashboard" },
  { label: "Repositories", path: "/dashboard/repositories", dataPath: "repositories" },
  { label: "CodeChat", path: "/codechat", dataPath: "codechat" },
  { label: "Incident Tracer", path: "/incident", dataPath: "incident-tracer" },
  { label: "Settings", path: "/dashboard/settings", dataPath: "settings" },
];

export default function DashboardHeader({ user, repos = [] }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRepoSwitcher, setShowRepoSwitcher] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");

  const activeRepo = repos[0];

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus("idle");
    try {
      const res = await fetch("/api/repositories/sync", { method: "POST" });
      if (res.ok) {
        setSyncStatus("success");
        setTimeout(() => setSyncStatus("idle"), 3000);
        window.dispatchEvent(new Event("kareixo:sync-complete"));
      } else {
        setSyncStatus("error");
        setTimeout(() => setSyncStatus("idle"), 3000);
      }
    } catch {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-canvas-subtle/95 backdrop-blur-md">
      <div className="h-16 w-full px-gutter flex items-center justify-between gap-space-md">
        {/* Left: Logo + Repo Switcher */}
        <div className="flex items-center gap-space-md min-w-0 flex-shrink-0">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-space-sm">
            <Image
              alt="Kareixo Logo"
              className="h-8 w-auto object-contain"
              src="/logo.png"
              width={32}
              height={32}
            />
            <span className="font-title-card text-title-card text-fg-default tracking-tight hidden sm:inline-block">
              Kareixo
            </span>
            <span className="font-badge-mono text-badge-mono px-space-xs py-0.5 rounded bg-surface-container text-fg-muted">
              v2.4
            </span>
          </Link>

          <div className="h-5 w-px bg-border-default hidden md:block" />

          {/* Repo Switcher */}
          {activeRepo && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowRepoSwitcher(!showRepoSwitcher)}
                className="flex items-center gap-space-xs bg-canvas-inset px-space-sm py-1.5 rounded-lg text-fg-default cursor-pointer group hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-fg-muted text-[18px] group-hover:text-accent-blue transition-colors">
                  folder_open
                </span>
                <span className="font-code-diff text-code-diff text-fg-default font-medium">
                  {activeRepo.fullName}
                </span>
                {activeRepo.defaultBranch && (
                  <span className="flex items-center gap-0.5 text-fg-muted font-badge-mono text-badge-mono px-1.5 py-0.5 bg-surface-container rounded">
                    <span className="material-symbols-outlined text-[14px] text-accent-purple">
                      alt_route
                    </span>
                    {activeRepo.defaultBranch}
                  </span>
                )}
                <span className="material-symbols-outlined text-fg-muted text-[16px]">
                  expand_more
                </span>
              </button>

              {/* Repo dropdown */}
              {showRepoSwitcher && repos.length > 1 && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-canvas-subtle rounded-lg border border-border-default shadow-xl z-50 py-1">
                  {repos.map((repo) => (
                    <button
                      key={repo.fullName}
                      className={`w-full text-left px-space-md py-2 font-code-diff text-code-diff hover:bg-surface-container transition-colors flex items-center gap-space-sm ${
                        repo.fullName === activeRepo.fullName
                          ? "text-accent-blue"
                          : "text-fg-default"
                      }`}
                      onClick={() => setShowRepoSwitcher(false)}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {repo.fullName === activeRepo.fullName ? "check" : "folder_open"}
                      </span>
                      {repo.fullName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GitHub App Status */}
          <div className="hidden xl:flex items-center gap-space-sm pl-space-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-diff-addition-line text-diff-addition-text font-badge-mono text-badge-mono">
              <span className="w-2 h-2 rounded-full bg-accent-green-emphasis animate-pulse" />
              GitHub App: Active
            </div>
          </div>
        </div>

        {/* Center: Nav */}
        <nav className="hidden lg:flex items-center gap-space-xs">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.dataPath}
              href={link.path}
              aria-current={isActive(link.path) ? "page" : undefined}
              data-path={link.dataPath}
              className={
                isActive(link.path)
                  ? "px-3 py-1.5 transition-colors text-fg-default bg-surface-container font-semibold rounded-lg"
                  : "px-3 py-1.5 text-on-surface-variant hover:text-fg-default hover:bg-surface-container-high rounded-lg transition-colors font-label-ui text-label-ui"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-space-sm flex-shrink-0">
          {/* Search */}
          <button
            className="flex items-center gap-space-sm bg-canvas-inset px-3 py-1.5 rounded-lg text-fg-muted hover:text-fg-default hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span className="hidden md:inline font-body-sm text-body-sm text-fg-subtle">
              Type{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container font-badge-mono text-badge-mono text-fg-muted">
                Cmd+K
              </kbd>{" "}
              to search
            </span>
          </button>

          {/* Sync button */}
          <button
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-fg-default font-label-ui text-label-ui transition-colors disabled:opacity-60"
            onClick={handleSync}
            disabled={syncing}
          >
            <span
              className={`material-symbols-outlined text-[16px] ${syncing ? "animate-spin" : ""}`}
            >
              {syncStatus === "success"
                ? "check_circle"
                : syncStatus === "error"
                  ? "error"
                  : "sync"}
            </span>
            <span className="hidden xl:inline">
              {syncing
                ? "Syncing..."
                : syncStatus === "success"
                  ? "Synced!"
                  : syncStatus === "error"
                    ? "Failed"
                    : "Sync"}
            </span>
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button
              className="relative p-1.5 text-fg-muted hover:text-fg-default rounded-lg hover:bg-surface-container transition-colors"
              title="Notifications"
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-blue" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-canvas-subtle rounded-xl border border-border-default shadow-xl p-space-md flex flex-col gap-3 z-50">
                <div className="flex items-center justify-between">
                  <span className="font-title-card-sm text-title-card-sm text-fg-default">
                    Notifications
                  </span>
                  <button
                    className="text-fg-muted hover:text-fg-default transition-colors"
                    onClick={() => setShowNotifications(false)}
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                  <span className="material-symbols-outlined text-[28px] text-fg-muted">
                    notifications_off
                  </span>
                  <p className="font-body-sm text-body-sm text-fg-muted">
                    No new notifications
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-border-default hidden sm:block" />

          {/* User avatar */}
          <div className="flex items-center gap-space-sm pl-space-xs cursor-pointer group">
            {user.image ? (
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-border-default"
                src={user.image}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              </div>
            )}
            <div className="hidden 2xl:flex flex-col text-left">
              <span className="font-label-ui text-label-ui text-fg-default font-medium leading-none">
                {user.name || "User"}
              </span>
              <span className="font-code-gutter text-code-gutter text-fg-subtle leading-none mt-1">
                workspace
              </span>
            </div>
            <span className="material-symbols-outlined text-fg-muted text-[16px] hidden sm:inline">
              arrow_drop_down
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
