import { auth, signOut } from "@/auth";
import { ProjectProvider } from "@/components/ide/ProjectContext";
import { Add, Setting2, ExportSquare, Information, NodeSquare, Automion, SecuritySafe, DocumentText, SearchNormal, TaskSquare, ArrowUp2 } from "iconsax-react";

export const dynamic = "force-dynamic";

export default async function IdeLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth();
  } catch (e: any) {
    if (e.digest === "DYNAMIC_SERVER_USAGE") throw e;
    console.error("[IdeLayout] auth() failed:", e);
  }

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1a1b1e] text-gray-300 font-body">
      <ProjectProvider>
        {/* ── Left Sidebar ── */}
        <aside className="w-[280px] bg-[#141517] border-r border-[#2b2d31] flex flex-col shrink-0 h-full">
          {/* Top Section */}
          <div className="p-4 flex flex-col gap-4">
            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer hover:bg-[#202124] p-2 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded bg-coral-500/20 text-coral-400 flex items-center justify-center text-sm font-bold border border-coral-500/30">
                {userInitial}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium text-gray-200 truncate">{session?.user?.name || session?.user?.email || "User"}</div>
                <div className="text-xs text-gray-500">Free Plan</div>
              </div>
            </div>

            {/* New Session Button */}
            <button className="flex items-center gap-2 w-full bg-[#202124] hover:bg-[#2b2d31] text-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-[#2b2d31]">
              <Add size={18} variant="Outline" className="text-gray-400" />
              New session
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 pb-2 border-b border-[#2b2d31]/50">
            <nav className="flex flex-col gap-0.5">
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors"><TaskSquare size={16} /> Automations</a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors"><SecuritySafe size={16} /> Security</a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors"><DocumentText size={16} /> Review</a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors"><NodeSquare size={16} /> Wiki</a>
            </nav>
          </div>

          {/* Recent Sessions */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Recent</span>
              <div className="flex items-center gap-2">
                <SearchNormal size={14} className="cursor-pointer hover:text-gray-300" />
                <span className="cursor-pointer hover:text-gray-300">...</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-0.5">
              {[
                { title: "StreamText timeout fix", time: "7 days ago", status: null },
                { title: "Add test coverage for chat.elixpo", time: "26 days ago", status: "PR is ready" },
                { title: "Security scan of chat.elixpo", time: "26 days ago", status: null },
                { title: "Refactor duplicated code in chat.elixpo", time: null, status: "PR is ready" },
                { title: "Improve error handling in chat.elixpo", time: null, status: "PR is ready" },
                { title: "Review recent changes in chat.elixpo", time: null, status: null },
                { title: "Find and fix an issue and PR", time: null, status: null },
              ].map((session, i) => (
                <div key={i} className="group flex flex-col px-3 py-2 rounded-md hover:bg-[#202124] cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <NodeSquare size={14} className="text-gray-500 shrink-0" variant="Outline" />
                    <span className="text-sm text-gray-300 truncate">{session.title}</span>
                  </div>
                  {(session.status || session.time) && (
                    <div className="flex items-center gap-2 mt-1 pl-6">
                      {session.status && <span className="text-[11px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/20">{session.status}</span>}
                      {session.time && <span className="text-[11px] text-gray-500">{session.time}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-[#2b2d31]/50 bg-[#141517]">
            <div className="flex flex-col gap-0.5">
              <button className="flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors w-full">
                <span className="flex items-center gap-3">
                  <ArrowUp2 size={16} /> Upgrade
                </span>
              </button>
              <button className="flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors w-full">
                <span className="flex items-center gap-3">
                  <Setting2 size={16} /> Settings
                </span>
              </button>
              <button className="flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors w-full">
                <span className="flex items-center gap-3">
                  <ExportSquare size={16} /> Download
                </span>
              </button>
              <button className="flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors w-full">
                <span className="flex items-center gap-3">
                  <Information size={16} /> Help
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Workspace Area ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#1a1b1e]">
          {children}
        </main>
      </ProjectProvider>
    </div>
  );
}
