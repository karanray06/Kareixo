import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-full bg-background font-body-base text-text-primary antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <Sidebar user={session.user} />
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
