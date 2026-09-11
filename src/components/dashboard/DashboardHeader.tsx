"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic breadcrumb from pathname
  const segments = pathname.replace("/dashboard", "").split("/").filter(Boolean);
  const breadcrumbLabel = segments.length > 0
    ? segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1)
    : "Overview";

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus("idle");
    try {
      const res = await fetch("/api/repositories/sync", { method: "POST" });
      if (res.ok) {
        setSyncStatus("success");
        setTimeout(() => setSyncStatus("idle"), 3000);
        // Trigger a page refresh so the dashboard picks up new data
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
    <header className="fixed top-0 left-[240px] right-0 h-14 bg-surface/90 backdrop-blur-md border-b border-border z-30 px-space-6 flex items-center justify-between">
      <div className="flex items-center gap-space-3 font-label-ui text-label-ui">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="hover:text-text-primary transition-colors">Dashboard</span>
          <span className="text-text-muted font-badge-mono">/</span>
          <span className="text-text-primary font-semibold">{breadcrumbLabel}</span>
        </div>
        <div className="hidden md:flex items-center ml-space-4 px-2 py-1 rounded bg-surface-subtle border border-border text-text-secondary font-badge-mono text-[11px] gap-2">
          <span className="material-symbols-outlined text-[14px] text-text-muted">search</span>
          <span>Quick navigate</span>
          <kbd className="px-1 py-0.5 rounded bg-surface border border-border text-[10px] text-text-primary">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-space-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-subtle border border-border font-badge-mono text-[11px] text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping"></span>
          <span>webhook live</span>
        </div>

        {/* Sync GitHub button */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-text-primary hover:bg-primary text-on-primary font-label-ui text-label-ui shadow-sm transition-all disabled:opacity-60"
          onClick={handleSync}
          disabled={syncing}
        >
          <span
            className={`material-symbols-outlined text-[16px] ${syncing ? "animate-spin" : ""}`}
          >
            {syncStatus === "success" ? "check_circle" : syncStatus === "error" ? "error" : "sync_alt"}
          </span>
          <span>
            {syncing
              ? "Syncing..."
              : syncStatus === "success"
                ? "Synced!"
                : syncStatus === "error"
                  ? "Failed"
                  : "Sync GitHub"}
          </span>
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-surface-subtle transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-xl border border-border shadow-xl p-space-4 flex flex-col gap-3 z-50">
              <div className="flex items-center justify-between">
                <span className="font-title-card-sm text-title-card-sm text-text-primary">
                  Notifications
                </span>
                <button
                  className="text-text-muted hover:text-text-primary transition-colors"
                  onClick={() => setShowNotifications(false)}
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                <span className="material-symbols-outlined text-[28px] text-text-muted">
                  notifications_off
                </span>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  No new notifications
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        {user.image ? (
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-border"
            src={user.image}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-container border border-border flex items-center justify-center font-bold text-xs">
            {user.name?.charAt(0) || "U"}
          </div>
        )}
      </div>
    </header>
  );
}
