"use client";

interface FileExplorerProps {
  files: string[];
  activeFile: string;
  onSelectFile: (file: string) => void;
}

export default function FileExplorer({ files, activeFile, onSelectFile }: FileExplorerProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 text-[11px] font-bold text-graphite-400 tracking-wider uppercase flex justify-between items-center shrink-0">
        <span>Explorer</span>
        <div className="flex gap-1 opacity-60">
          <button className="hover:text-white" title="New File">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-1">
        {files.map((file) => {
          const isActive = file === activeFile;
          // Simple icon logic based on extension
          const ext = file.split('.').pop();
          let color = "text-graphite-400";
          if (ext === "js" || ext === "ts" || ext === "tsx") color = "text-amber-400";
          else if (ext === "json") color = "text-green-400";
          else if (ext === "css") color = "text-cyan-400";
          
          return (
            <button
              key={file}
              onClick={() => onSelectFile(file)}
              className={`w-full text-left px-4 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${
                isActive 
                  ? "bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-400 pl-[14px]" 
                  : "text-graphite-300 hover:bg-graphite-800 border-l-2 border-transparent"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={color}>
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <span className="truncate font-mono">{file}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
