import { auth, signOut } from "@/auth";
import { ProjectProvider } from "@/components/ide/ProjectContext";
import Sidebar from "@/components/ide/Sidebar";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function IdeLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth();
  } catch (e: any) {
    if (e.digest === "DYNAMIC_SERVER_USAGE") throw e;
    console.error("[IdeLayout] auth() failed:", e);
  }

  if (!session?.user) {
    redirect("/login");
  }

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1a1b1e] text-gray-300 font-body">
      <ProjectProvider>
        {/* ── Left Sidebar ── */}
        <Sidebar userInitial={userInitial} userName={session?.user?.name || session?.user?.email || "User"} />

        {/* ── Main Workspace Area ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#1a1b1e]">
          {children}
        </main>
      </ProjectProvider>
    </div>
  );
}
