"use client";

import dynamic from "next/dynamic";

// IdeClient contains react-resizable-panels, Monaco, and xterm — all of which
// use browser-only APIs (window.matchMedia, localStorage, etc.).
// Loading with ssr: false prevents Next.js from ever running them on the server.
const IdeClient = dynamic(() => import("@/components/ide/IdeClient"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-950 text-graphite-400">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-graphite-600 border-t-cyan-400 rounded-full animate-spin" />
        Loading IDE...
      </div>
    </div>
  ),
});

export default function IdePage() {
  return <IdeClient />;
}
