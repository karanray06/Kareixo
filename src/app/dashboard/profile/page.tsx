"use client";

import { useSession } from "next-auth/react";
import { User, ShieldCheck, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1280px] w-full mx-auto px-space-6 py-space-8 flex flex-col gap-space-6">
        {/* Header */}
        <div className="pb-space-4 border-b border-border">
          <h1 className="font-headline-section text-headline-section text-text-primary tracking-tight">
            Profile
          </h1>
          <p className="font-body-base text-body-base text-text-secondary mt-1">
            Manage your personal profile and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-6">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-space-6">
            <div className="glass-card p-6 flex flex-col gap-6">
              <div className="flex items-center gap-6">
                {session?.user?.image ? (
                  <img
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-border-default shadow-md"
                    src={session.user.image}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-surface-container border-2 border-border-default flex items-center justify-center font-bold text-3xl text-fg-default shadow-md">
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <h2 className="font-headline-section text-[24px] text-fg-default font-semibold">
                    {session?.user?.name || "User"}
                  </h2>
                  <div className="flex items-center gap-2 text-fg-muted font-body-sm">
                    <Mail size={14} />
                    <span>{session?.user?.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-badge-mono text-[11px] text-accent-green-emphasis bg-accent-green-emphasis/10 px-2 py-0.5 rounded flex items-center gap-1.5 border border-accent-green-emphasis/20">
                      <ShieldCheck size={12} />
                      Connected via GitHub
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-space-4">
            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-fg-subtle" />
                <h3 className="font-title-card-sm text-title-card-sm text-fg-default font-semibold">
                  Member Since
                </h3>
              </div>
              <p className="font-body-sm text-body-sm text-fg-muted">
                You joined Kareixo recently. Welcome to the platform!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
