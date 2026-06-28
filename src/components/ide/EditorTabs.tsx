"use client";

interface EditorTabsProps {
  activeFile: string;
}

export default function EditorTabs({ activeFile }: EditorTabsProps) {
  return (
    <div className="h-9 flex bg-slate-950 border-b border-graphite-700 shrink-0 overflow-x-auto">
      <div className="flex h-full min-w-0">
        {/* We only render one tab for the active file in this v1 demo */}
        <div className="flex items-center h-full px-4 border-r border-graphite-700 bg-graphite-900 border-t-2 border-t-cyan-400 group min-w-[120px] max-w-[200px]">
          <span className="text-[13px] font-mono text-graphite-100 truncate flex-1 select-none">
            {activeFile.split('/').pop()}
          </span>
          <button className="ml-2 w-4 h-4 rounded hover:bg-graphite-700 flex items-center justify-center text-graphite-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
