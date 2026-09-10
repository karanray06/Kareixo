"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "flex items-center gap-space-3 px-space-3 py-2 rounded-lg transition-colors bg-surface-subtle text-text-primary font-semibold shadow-sm";
    }
    return "flex items-center gap-space-3 px-space-3 py-2 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors font-label-ui text-label-ui";
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-surface border-r border-border z-40 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        <div className="h-14 px-space-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-space-2">
            <img src="/logo.png" alt="Kareixo Logo" className="w-7 h-7 rounded-md object-contain" />
            <span className="font-title-card-sm text-title-card-sm text-text-primary tracking-tight">Kareixo</span>
          </div>
          <span className="px-1.5 py-0.5 rounded font-badge-mono text-[10px] uppercase font-semibold bg-accent-ai-subtle text-secondary border border-outline-variant/30">v1.4</span>
        </div>
        <div className="p-space-3">
          <div className="text-[11px] font-label-ui uppercase tracking-wider text-text-secondary px-space-3 py-1 font-semibold">Platform</div>
          <nav className="flex flex-col gap-0.5 mt-1">
            <Link aria-current={pathname === "/dashboard" ? "page" : undefined} className={getLinkClasses("/dashboard")} href="/dashboard">
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              <span>Overview</span>
            </Link>
            <Link aria-current={pathname === "/dashboard/repositories" ? "page" : undefined} className={getLinkClasses("/dashboard/repositories")} href="/dashboard/repositories">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              <span>Repositories</span>
            </Link>
            <Link aria-current={pathname === "/dashboard/reviews" ? "page" : undefined} className={getLinkClasses("/dashboard/reviews")} href="/dashboard/reviews">
              <span className="material-symbols-outlined text-[18px]">rate_review</span>
              <span>Reviews</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            </Link>
          </nav>
          <div className="my-space-3 border-t border-border"></div>
          <div className="text-[11px] font-label-ui uppercase tracking-wider text-text-secondary px-space-3 py-1 font-semibold">System</div>
          <nav className="flex flex-col gap-0.5 mt-1">
            <Link aria-current={pathname === "/dashboard/settings" ? "page" : undefined} className={getLinkClasses("/dashboard/settings")} href="/dashboard/settings">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Settings</span>
            </Link>
            <a className="flex items-center justify-between px-space-3 py-2 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors font-label-ui text-label-ui" href="https://github.com/apps/kareixo-reviewer/installations/new" rel="noreferrer" target="_blank">
              <div className="flex items-center gap-space-3">
                <span className="material-symbols-outlined text-[18px]">code</span>
                <span>GitHub</span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-text-muted">open_in_new</span>
            </a>
          </nav>
        </div>
      </div>
      <div className="p-space-3 border-t border-border bg-surface-bright">
        <div className="flex items-center gap-space-3 px-space-2 py-2 rounded-lg hover:bg-surface transition-colors">
          {user.image ? (
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover border border-border" src={user.image} />
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface-container border border-border flex items-center justify-center font-bold text-xs">
              {user.name?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-ui text-label-ui text-text-primary truncate font-semibold">{user.name}</span>
            <span className="font-badge-mono text-[11px] text-text-muted truncate">{user.email}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-success" title="Cluster Online"></span>
        </div>
        <div className="mt-2 px-space-2 flex items-center justify-between font-badge-mono text-[10px] text-text-secondary">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>us-east.cluster</span>
          <span className="text-text-muted">99.98%</span>
        </div>
      </div>
    </aside>
  );
}
