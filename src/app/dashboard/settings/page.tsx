"use client";

import { useSession, signOut } from "next-auth/react";

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
            <div className="bg-surface rounded-xl border border-border p-space-6 flex flex-col gap-space-4 shadow-sm">
              <div className="flex items-center gap-2 pb-space-3 border-b border-border">
                <span className="material-symbols-outlined text-[18px] text-text-secondary">
                  person
                </span>
                <h2 className="font-title-card-sm text-title-card-sm text-text-primary">
                  Account
                </h2>
              </div>

              <div className="flex items-center gap-space-4">
                {session?.user?.image ? (
                  <img
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                    src={session.user.image}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-surface-container border-2 border-border flex items-center justify-center font-bold text-xl text-text-primary">
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="font-title-card-sm text-title-card-sm text-text-primary">
                    {session?.user?.name || "User"}
                  </span>
                  <span className="font-badge-mono text-badge-mono text-text-secondary">
                    {session?.user?.email || "No email"}
                  </span>
                  <span className="font-badge-mono text-[11px] text-text-muted flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">
                      verified
                    </span>
                    Connected via GitHub OAuth
                  </span>
                </div>
              </div>
            </div>

            {/* GitHub App */}
            <div className="bg-surface rounded-xl border border-border p-space-6 flex flex-col gap-space-4 shadow-sm">
              <div className="flex items-center gap-2 pb-space-3 border-b border-border">
                <span className="material-symbols-outlined text-[18px] text-text-secondary">
                  code
                </span>
                <h2 className="font-title-card-sm text-title-card-sm text-text-primary">
                  GitHub App Installation
                </h2>
              </div>

              <p className="font-body-base text-body-base text-text-secondary">
                Manage which repositories Kareixo has access to by updating your GitHub App
                installation settings.
              </p>

              <div className="flex items-center gap-3">
                <a
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-subtle border border-border text-text-primary font-label-ui text-label-ui hover:bg-surface-container transition-colors"
                  href="https://github.com/apps/kareixo-reviewer/installations/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined text-[16px]">settings</span>
                  <span>Manage Installation</span>
                  <span className="material-symbols-outlined text-[14px] text-text-muted">
                    open_in_new
                  </span>
                </a>
              </div>
            </div>

            {/* Review Preferences */}
            <div className="bg-surface rounded-xl border border-border p-space-6 flex flex-col gap-space-4 shadow-sm">
              <div className="flex items-center gap-2 pb-space-3 border-b border-border">
                <span className="material-symbols-outlined text-[18px] text-text-secondary">
                  tune
                </span>
                <h2 className="font-title-card-sm text-title-card-sm text-text-primary">
                  Review Preferences
                </h2>
              </div>

              <p className="font-body-base text-body-base text-text-secondary">
                Per-repository review settings (categories, analysis tier, custom instructions) can
                be configured from each repository&apos;s detail page.
              </p>

              <a
                className="inline-flex items-center gap-1.5 text-secondary font-label-ui text-label-ui hover:underline underline-offset-4 transition-colors self-start"
                href="/dashboard/repositories"
              >
                <span>Go to Repositories</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-space-4">
            {/* Plan */}
            <div className="bg-surface rounded-xl border border-border p-space-4 flex flex-col gap-space-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  workspace_premium
                </span>
                <h3 className="font-title-card-sm text-title-card-sm text-text-primary">
                  Plan
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-surface-subtle border border-border text-center">
                <span className="font-headline-section text-[24px] text-text-primary font-bold">
                  Free
                </span>
                <p className="font-badge-mono text-[11px] text-text-muted mt-1">
                  Unlimited public &amp; private PR reviews
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-surface rounded-xl border border-error/30 p-space-4 flex flex-col gap-space-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-error">warning</span>
                <h3 className="font-title-card-sm text-title-card-sm text-text-primary">
                  Danger Zone
                </h3>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">
                Sign out of your account or disconnect the GitHub App integration.
              </p>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-error/40 text-error font-label-ui text-label-ui hover:bg-error-subtle transition-colors"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
