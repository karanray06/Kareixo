"use client";

import { useSession, signOut } from "next-auth/react";
import { User, ShieldCheck, Code2, Settings, ExternalLink, SlidersHorizontal, ArrowRight, Award, AlertTriangle, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1280px] w-full mx-auto px-space-6 py-space-8 flex flex-col gap-space-6">
        {/* Header */}
        <div className="pb-space-4 border-b border-border">
          <h1 className="font-headline-section text-headline-section text-text-primary tracking-tight">
            Settings
          </h1>
          <p className="font-body-base text-body-base text-text-secondary mt-1">
            Manage your account and Kareixo configuration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-6">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-space-6">
            {/* Account */}
            <div className="card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border-default">
                <User size={18} className="text-fg-subtle" />
                <h2 className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                  Account
                </h2>
              </div>

              <div className="flex items-center gap-4">
                {session?.user?.image ? (
                  <img
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-border-default shadow-md"
                    src={session.user.image}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-surface-container border-2 border-border-default flex items-center justify-center font-bold text-xl text-fg-default shadow-md">
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                    {session?.user?.name || "User"}
                  </span>
                  <span className="font-badge-mono text-badge-mono text-fg-muted">
                    {session?.user?.email || "No email"}
                  </span>
                  <span className="font-badge-mono text-[11px] text-fg-subtle flex items-center gap-1.5 mt-1">
                    <ShieldCheck size={14} className="text-accent-blue" />
                    Connected via GitHub OAuth
                  </span>
                </div>
              </div>
            </div>

            {/* GitHub App */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border-default">
                <Code2 size={18} className="text-fg-subtle" />
                <h2 className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                  GitHub App Installation
                </h2>
              </div>

              <p className="font-body-base text-body-base text-fg-muted">
                Manage which repositories Kareixo has access to by updating your GitHub App
                installation settings.
              </p>

              <div className="flex items-center gap-3">
                <a
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container/50 border border-border-default text-fg-default font-label-ui text-label-ui hover:bg-surface-container-high transition-colors shadow-sm"
                  href="https://github.com/apps/kareixo-reviewer/installations/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Settings size={16} />
                  <span>Manage Installation</span>
                  <ExternalLink size={14} className="text-fg-muted" />
                </a>
              </div>
            </div>

            {/* Review Preferences */}
            <div className="glass-card p-6 flex flex-col gap-6">
              <div className="flex items-center gap-2 pb-3 border-b border-border-default">
                <SlidersHorizontal size={18} className="text-fg-subtle" />
                <h2 className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                  Review Preferences
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-ui text-label-ui text-fg-default">
                    Default Review Tier
                  </label>
                  <p className="font-body-sm text-body-sm text-fg-muted mb-2">
                    The analysis depth to apply by default for new repositories.
                  </p>
                  <select className="input max-w-xs">
                    <option value="fast">Fast (Lighter analysis, faster response)</option>
                    <option value="deep">Deep (Comprehensive security & logic analysis)</option>
                  </select>
                </div>
                
                <div className="h-px bg-border-default my-2" />

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-ui text-label-ui text-fg-default">
                    Digest Webhook URL (Optional)
                  </label>
                  <p className="font-body-sm text-body-sm text-fg-muted mb-2">
                    Provide a Slack or Discord webhook URL to receive daily review digests.
                  </p>
                  <input type="url" placeholder="https://hooks.slack.com/services/..." className="input" />
                </div>
                
                <div className="flex justify-end mt-2">
                  <button className="btn btn-primary">Save Preferences</button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-space-4">
            {/* Plan */}
            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-accent-purple" />
                <h3 className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                  Plan
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-surface-container/30 border border-border-default text-center">
                <span className="font-headline-section text-[24px] text-fg-default font-bold">
                  Free
                </span>
                <p className="font-badge-mono text-[11px] text-fg-muted mt-1">
                  Unlimited public &amp; private PR reviews
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-4 flex flex-col gap-3 border-error/30 hover:border-error/50">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-error" />
                <h3 className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                  Danger Zone
                </h3>
              </div>
              <p className="font-body-sm text-body-sm text-fg-muted">
                Sign out of your account or disconnect the GitHub App integration.
              </p>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-error/40 text-error font-label-ui text-label-ui hover:bg-error/10 transition-colors shadow-sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
