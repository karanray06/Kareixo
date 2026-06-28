import { auth, signOut } from "@/auth";
import QuotaDashboard from "@/components/ide/QuotaDashboard";
import { ProjectProvider } from "@/components/ide/ProjectContext";
import ProjectHeader from "@/components/ide/ProjectHeader";

export const dynamic = "force-dynamic";

export default async function IdeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth();
  } catch (e: any) {
    if (e.digest === "DYNAMIC_SERVER_USAGE") {
      throw e; // Let Next.js handle dynamic route bailouts internally
    }
    console.error("[IdeLayout] auth() failed:", e);
  }

  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-cream-50 text-dusk-900">
      <ProjectProvider>
        {/* App Header */}
        <header className="h-[var(--header-height)] border-b border-cream-300 bg-cream-100 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center justify-center">
            <div className="w-6 h-6 rounded flex items-center justify-center glow-cyan bg-coral-400/20 border border-coral-400/40">
              <div className="w-2 h-2 border border-coral-300" style={{ transform: "rotate(45deg)" }} />
            </div>
          </a>
          <div className="h-4 w-px bg-cream-300" />
          <ProjectHeader />
        </div>
        
        <div className="flex items-center gap-4">
          <QuotaDashboard />
          <div className="h-4 w-px bg-cream-300" />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="text-xs text-dusk-500 hover:text-dusk-900 transition-colors">
              Sign out
            </button>
          </form>
          <div className="relative group">
            <div className="w-7 h-7 rounded-full bg-cream-300 flex items-center justify-center text-xs font-bold text-dusk-900 border border-dusk-400 relative overflow-visible">
              {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-[1.5px] border-cream-100 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Session Active & Synced" />
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
