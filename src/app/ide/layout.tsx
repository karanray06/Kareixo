import { auth, signOut } from "@/auth";
import QuotaDashboard from "@/components/ide/QuotaDashboard";
import { ProjectProvider } from "@/components/ide/ProjectContext";
import ProjectHeader from "@/components/ide/ProjectHeader";

export default async function IdeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-graphite-100">
      <ProjectProvider>
        {/* App Header */}
        <header className="h-[var(--header-height)] border-b border-graphite-700 bg-graphite-900 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center justify-center">
            <div className="w-6 h-6 rounded flex items-center justify-center glow-cyan bg-cyan-400/20 border border-cyan-400/40">
              <div className="w-2 h-2 border border-cyan-300" style={{ transform: "rotate(45deg)" }} />
            </div>
          </a>
          <div className="h-4 w-px bg-graphite-700" />
          <ProjectHeader />
        </div>
        
        <div className="flex items-center gap-4">
          <QuotaDashboard />
          <div className="h-4 w-px bg-graphite-700" />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="text-xs text-graphite-400 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
          <div className="relative group">
            <div className="w-7 h-7 rounded-full bg-graphite-700 flex items-center justify-center text-xs font-bold text-white border border-graphite-600 relative overflow-visible">
              {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-[1.5px] border-graphite-900 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Session Active & Synced" />
            </div>
          </div>
        </div>
      </header>

        {/* Main Workspace Area */}
        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>
      </ProjectProvider>
    </div>
  );
}
