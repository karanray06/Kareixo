import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  GitMerge, 
  Activity, 
  Settings, 
  LogOut,
  TerminalSquare
} from "lucide-react";
import { FiGithub } from "react-icons/fi";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-[var(--border-base)] bg-[var(--bg-surface)] flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--text-primary)] rounded-md flex items-center justify-center">
              <span className="text-[var(--bg-base)] text-xs font-bold font-mono">K</span>
            </div>
            Kareixo
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)]">
            <LayoutDashboard size={18} />
            Overview
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors">
            <FiGithub size={18} />
            Repositories
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors">
            <Activity size={18} />
            Reviews
          </Link>
          <Link href="/codechat" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors">
            <TerminalSquare size={18} />
            Code Chat
          </Link>
          
          <div className="pt-4 mt-4 border-t border-[var(--border-base)]">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors">
              <Settings size={18} />
              Settings
            </Link>
            <a href="https://github.com/apps/kareixo-reviewer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors">
              <GitMerge size={18} />
              GitHub App
            </a>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[var(--border-base)]">
          <div className="flex items-center gap-3 px-3 py-2">
            {session.user.image ? (
              <img src={session.user.image} alt="User avatar" className="w-8 h-8 rounded-full border border-[var(--border-base)]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-base)] flex items-center justify-center text-xs font-bold">
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto bg-[var(--bg-base)]">
        {children}
      </main>
    </div>
  );
}
