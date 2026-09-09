import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-full bg-background font-body-base text-text-primary antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <aside className="fixed left-0 top-0 h-full w-[240px] bg-surface border-r border-border z-40 flex flex-col justify-between select-none"><div className="flex flex-col"><div className="h-14 px-space-4 flex items-center justify-between border-b border-border"><div className="flex items-center gap-space-2"><img src="/logo.png" alt="Kareixo Logo" className="w-7 h-7 rounded-md object-contain" /><span className="font-title-card-sm text-title-card-sm text-text-primary tracking-tight">Kareixo</span></div><span className="px-1.5 py-0.5 rounded font-badge-mono text-[10px] uppercase font-semibold bg-accent-ai-subtle text-secondary border border-outline-variant/30">v1.4</span></div><div className="p-space-3"><div className="text-[11px] font-label-ui uppercase tracking-wider text-text-secondary px-space-3 py-1 font-semibold">Platform</div><nav className="flex flex-col gap-0.5 mt-1" data-active-classes="bg-surface-subtle text-text-primary font-semibold shadow-sm"><a aria-current="page" className="flex items-center gap-space-3 px-space-3 py-2 rounded-lg transition-colors bg-surface-subtle text-text-primary font-semibold shadow-sm" data-path="overview" href="#"><span className="material-symbols-outlined text-[18px]">grid_view</span><span>Overview</span></a><a className="flex items-center gap-space-3 px-space-3 py-2 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors font-label-ui text-label-ui" data-path="repositories" href="#"><span className="material-symbols-outlined text-[18px]">terminal</span><span>Repositories</span></a><a className="flex items-center gap-space-3 px-space-3 py-2 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors font-label-ui text-label-ui" data-path="reviews" href="#"><span className="material-symbols-outlined text-[18px]">rate_review</span><span>Reviews</span><span className="ml-auto w-2 h-2 rounded-full bg-secondary animate-pulse"></span></a></nav><div className="my-space-3 border-t border-border"></div><div className="text-[11px] font-label-ui uppercase tracking-wider text-text-secondary px-space-3 py-1 font-semibold">System</div><nav className="flex flex-col gap-0.5 mt-1" data-active-classes="bg-surface-subtle text-text-primary font-semibold"><a className="flex items-center gap-space-3 px-space-3 py-2 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors font-label-ui text-label-ui" data-path="settings" href="#"><span className="material-symbols-outlined text-[18px]">tune</span><span>Settings</span></a><a className="flex items-center justify-between px-space-3 py-2 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors font-label-ui text-label-ui" href="https://github.com" rel="noreferrer" target="_blank"><div className="flex items-center gap-space-3"><span className="material-symbols-outlined text-[18px]">code</span><span>GitHub</span></div><span className="material-symbols-outlined text-[14px] text-text-muted">open_in_new</span></a></nav></div></div><div className="p-space-3 border-t border-border bg-surface-bright"><div className="flex items-center gap-space-3 px-space-2 py-2 rounded-lg hover:bg-surface transition-colors">{session.user.image ? (
    <img alt="Profile" className="w-8 h-8 rounded-full object-cover border border-border" src={session.user.image} />
  ) : (
    <div className="w-8 h-8 rounded-full bg-surface-container border border-border flex items-center justify-center font-bold text-xs">
      {session.user.name?.charAt(0) || "U"}
    </div>
  )}<div className="flex flex-col min-w-0 flex-1"><span className="font-label-ui text-label-ui text-text-primary truncate font-semibold">{session.user.name}</span><span className="font-badge-mono text-[11px] text-text-muted truncate">{session.user.email}</span></div><span className="w-2 h-2 rounded-full bg-success" title="Cluster Online"></span></div><div className="mt-2 px-space-2 flex items-center justify-between font-badge-mono text-[10px] text-text-secondary"><span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>us-east.cluster</span><span className="text-text-muted">99.98%</span></div></div></aside>
      
      <div className="pl-[240px]">
        <header className="fixed top-0 left-[240px] right-0 h-14 bg-surface/90 backdrop-blur-md border-b border-border z-30 px-space-6 flex items-center justify-between"><div className="flex items-center gap-space-3 font-label-ui text-label-ui"><div className="flex items-center gap-1.5 text-text-secondary"><span className="hover:text-text-primary transition-colors">Dashboard</span><span className="text-text-muted font-badge-mono">/</span><span className="text-text-primary font-semibold">Overview</span></div><div className="hidden md:flex items-center ml-space-4 px-2 py-1 rounded bg-surface-subtle border border-border text-text-secondary font-badge-mono text-[11px] gap-2"><span className="material-symbols-outlined text-[14px] text-text-muted">search</span><span>Quick navigate</span><kbd className="px-1 py-0.5 rounded bg-surface border border-border text-[10px] text-text-primary">⌘K</kbd></div></div><div className="flex items-center gap-space-3"><div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-subtle border border-border font-badge-mono text-[11px] text-text-secondary"><span className="w-1.5 h-1.5 rounded-full bg-success animate-ping"></span><span>webhook live</span></div><button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-text-primary hover:bg-primary text-on-primary font-label-ui text-label-ui shadow-sm transition-all"><span className="material-symbols-outlined text-[16px]">sync_alt</span><span>Sync GitHub</span></button><button className="p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-surface-subtle transition-colors"><span className="material-symbols-outlined text-[20px]">notifications</span></button>{session.user.image ? (
    <img alt="Profile" className="w-8 h-8 rounded-full object-cover border border-border" src={session.user.image} />
  ) : (
    <div className="w-8 h-8 rounded-full bg-surface-container border border-border flex items-center justify-center font-bold text-xs">
      {session.user.name?.charAt(0) || "U"}
    </div>
  )}</div></header>
        
        <main className="pt-14 w-full min-h-screen bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
