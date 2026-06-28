"use client";

interface EditorTabsProps {
  activeFile: string;
  isDirty?: boolean;
}

export default function EditorTabs({ activeFile, isDirty }: EditorTabsProps) {
  return (
    <div className="h-9 flex bg-cream-50 border-b border-cream-300 shrink-0 overflow-x-auto">
      <div className="flex h-full min-w-0">
        {/* We only render one tab for the active file in this v1 demo */}
        <div className="flex items-center h-full px-4 border-r border-cream-300 bg-cream-100 border-t-2 border-t-coral-400 group min-w-[120px] max-w-[200px]">
          <span className="text-[13px] font-mono text-dusk-900 truncate flex-1 select-none flex items-center gap-2">
            {activeFile.split('/').pop()}
            {isDirty && <div className="w-2 h-2 rounded-full bg-dusk-700 shrink-0" title="Unsaved changes" />}
          </span>
          <button className="ml-2 w-4 h-4 rounded hover:bg-cream-300 flex items-center justify-center text-dusk-500 hover:text-dusk-900 opacity-0 group-hover:opacity-100 transition-opacity">
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
