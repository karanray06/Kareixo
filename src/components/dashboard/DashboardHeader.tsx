"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FolderOpen, GitBranch, ChevronDown, Check, Search, RefreshCw, CheckCircle, AlertCircle, Bell, X, BellOff, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { signOut } from "next-auth/react";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  repos?: { fullName: string; defaultBranch?: string }[];
}

const PRIMARY_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Repositories", path: "/dashboard/repositories" },
  { label: "Live Review", path: "/dashboard/live-review" },
];

const SECONDARY_LINKS = [
  { label: "Heatmap", path: "/dashboard/heatmap" },
  { label: "CodeChat", path: "/codechat" },
  { label: "Incident Tracer", path: "/incident" },
  { label: "Settings", path: "/dashboard/settings" },
];

export default function DashboardHeader({ user, repos = [] }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRepoSwitcher, setShowRepoSwitcher] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
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
    <header className="fixed top-0 left-0 w-full z-50 bg-canvas-dark border-b border-border-dark">
      <div className="h-16 w-full px-gutter flex items-center justify-between gap-space-md">
        {/* Left: Logo + Repo Switcher */}
        <div className="flex items-center gap-space-md min-w-0 flex-shrink-0">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-space-sm">
            <Image
              alt="Kareixo Logo"
              className="h-8 w-auto object-contain"
              src="/logo-dark.svg"
              width={32}
              height={32}
            />
            <span className="font-title-card text-title-card text-fg-default tracking-tight hidden sm:inline-block">
              Kareixo
            </span>
            <span className="font-badge-mono text-badge-mono px-space-xs py-0.5 bg-transparent text-fg-muted">
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
                <FolderOpen size={18} className="text-fg-muted group-hover:text-accent-blue transition-colors" />
                <span className="font-code-diff text-code-diff text-fg-default font-medium">
                  {activeRepo.fullName}
                </span>
                {activeRepo.defaultBranch && (
                  <span className="flex items-center gap-0.5 text-fg-muted font-badge-mono text-badge-mono px-1.5 py-0.5 bg-surface-container rounded">
                    <GitBranch size={14} className="text-accent-purple" />
                    {activeRepo.defaultBranch}
                  </span>
                )}
                <ChevronDown size={16} className="text-fg-muted" />
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
                      {repo.fullName === activeRepo.fullName ? (
                        <Check size={16} />
                      ) : (
                        <FolderOpen size={16} />
                      )}
                      {repo.fullName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GitHub App Status */}
          <div className="hidden 2xl:flex items-center gap-space-sm pl-space-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-fg-muted font-badge-mono text-badge-mono">
              <span className="w-2 h-2 rounded-full bg-signal" />
              GitHub App: Active
            </div>
          </div>
        </div>

        {/* Center: Nav */}
        <nav className="hidden lg:flex items-center gap-space-xs">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              aria-current={isActive(link.path) ? "page" : undefined}
              data-path={link.path}
              className={
                isActive(link.path)
                  ? "relative px-3 py-1.5 text-fg-default font-semibold transition-colors after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-signal after:rounded-full"
                  : "px-3 py-1.5 text-fg-muted hover:text-fg-default transition-colors font-label-ui text-label-ui"
              }
            >
              {link.label}
            </Link>
          ))}

          {/* Secondary links (inline on 2xl+) */}
          <div className="hidden 2xl:flex items-center gap-space-xs">
            {SECONDARY_LINKS.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                aria-current={isActive(link.path) ? "page" : undefined}
                data-path={link.path}
                className={
                  isActive(link.path)
                    ? "relative px-3 py-1.5 text-fg-default font-semibold transition-colors after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-signal after:rounded-full"
                    : "px-3 py-1.5 text-fg-muted hover:text-fg-default transition-colors font-label-ui text-label-ui"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* More dropdown (visible on lg, hidden on 2xl+) */}
          <div className="relative flex 2xl:hidden">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`px-3 py-1.5 transition-colors font-label-ui text-label-ui flex items-center gap-1 ${
                SECONDARY_LINKS.some(link => isActive(link.path)) 
                  ? "text-fg-default font-semibold" 
                  : "text-fg-muted hover:text-fg-default"
              }`}
            >
              More
              <ChevronDown size={14} className="opacity-70" />
            </button>
            {showMoreMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-canvas-dark rounded-xl border border-border-default shadow-xl py-2 z-50">
                {SECONDARY_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setShowMoreMenu(false)}
                    className={`block px-4 py-2 font-label-ui text-label-ui hover:bg-surface-container transition-colors ${
                      isActive(link.path) ? "text-signal font-semibold" : "text-fg-default"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-space-sm flex-shrink-0">
          {/* Search */}
          <button
            className="flex items-center gap-space-sm bg-canvas-inset px-3 py-1.5 rounded-lg text-fg-muted hover:text-fg-default hover:bg-surface-container transition-colors"
            type="button"
          >
            <Search size={18} />
            <span className="hidden 2xl:inline font-body-sm text-body-sm text-fg-muted">
              Type{" "}
              <kbd className="px-1.5 py-0.5 font-badge-mono text-badge-mono text-fg-muted border border-border-dark">
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
            {syncStatus === "success" ? (
              <CheckCircle size={16} />
            ) : syncStatus === "error" ? (
              <AlertCircle size={16} />
            ) : (
              <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            )}
            <span className="hidden 2xl:inline">
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
              className="relative p-1.5 text-fg-muted hover:text-fg-default transition-colors"
              title="Notifications"
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-signal" />
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
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                  <BellOff size={28} className="text-fg-muted" />
                  <p className="font-body-sm text-body-sm text-fg-muted">
                    No new notifications
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-border-default hidden sm:block" />

          {/* User avatar */}
          <div className="relative">
            <div 
              className="flex items-center gap-space-sm pl-space-xs cursor-pointer group"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {user.image ? (
                <img
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-border-default"
                  src={user.image}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <User size={18} className="text-on-primary" />
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
              <ChevronDown size={16} className="text-fg-muted hidden sm:inline" />
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-canvas-subtle rounded-xl border border-border-default shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-border-default mb-1">
                  <p className="font-label-ui text-label-ui text-fg-default font-medium truncate">{user.name || "User"}</p>
                  <p className="font-body-sm text-body-sm text-fg-muted truncate">{user.email || ""}</p>
                </div>
                
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-2 font-label-ui text-label-ui text-fg-default hover:bg-surface-container transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User size={16} className="text-fg-muted" />
                  Your Profile
                </Link>
                
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 font-label-ui text-label-ui text-fg-default hover:bg-surface-container transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <SettingsIcon size={16} className="text-fg-muted" />
                  Settings
                </Link>

                <div className="h-px bg-border-default my-1" />
                
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 font-label-ui text-label-ui text-error hover:bg-error/10 transition-colors"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
