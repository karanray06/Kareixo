import Navbar from "@/components/landing/Navbar";
import { FiGithub, FiCheckCircle, FiActivity } from "react-icons/fi";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold font-display">Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-2">Manage your connected repositories and view recent activity.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Connected Repositories</h2>
            <div className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6">
              <div className="flex items-center justify-between py-4 border-b border-[var(--color-outline)]/10">
                <div className="flex items-center gap-4">
                  <FiGithub className="w-6 h-6 text-[var(--text-secondary)]" />
                  <div>
                    <h3 className="font-bold">karanray06/Kareixo</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Installed on Main Branch</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-mint)]">
                  <FiCheckCircle />
                  Active
                </div>
              </div>
              <div className="py-4 mt-4 text-center">
                <a href="#" className="text-[var(--color-sky-blue)] hover:underline text-sm font-semibold">
                  + Add more repositories on GitHub
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <div className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--color-sky-blue)]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <FiActivity className="text-[var(--color-sky-blue)]" />
                </div>
                <div>
                  <p className="text-sm">Reviewed <span className="font-semibold">PR #42</span> on <span className="font-semibold">Kareixo</span></p>
                  <p className="text-xs text-[var(--text-secondary)]">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--color-sky-blue)]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <FiActivity className="text-[var(--color-sky-blue)]" />
                </div>
                <div>
                  <p className="text-sm">Reviewed <span className="font-semibold">PR #41</span> on <span className="font-semibold">Kareixo</span></p>
                  <p className="text-xs text-[var(--text-secondary)]">5 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
