"use client";

import { useState, useRef, useEffect } from "react";

interface FileExplorerProps {
  files: string[];
  activeFile: string;
  onSelectFile: (file: string) => void;
  onNewFile?: (path: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onDeleteFile?: (path: string) => void;
}

// ── Icons ──────────────────────────────────────────────────────────────────
const Icons = {
  Folder: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-graphite-400"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  FolderOpen: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-graphite-400"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>,
  React: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"/></svg>,
  TS: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"><path d="M4 4h16v16H4z"/><path d="M9 9v6"/><path d="M7 9h4"/><path d="M15 15c-1.5 0-2-1-2-1v-1s.5 1 2 1 2-.5 2-1-.5-2-2-2-2-.5-2-2 .5-2 2-2 2 .5 2 1"/><path d="M17 11h-2"/></svg>,
  JS: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400"><path d="M4 4h16v16H4z"/><path d="M9 15v-6"/><path d="M15 15c-1.5 0-2-1-2-1v-1s.5 1 2 1 2-.5 2-1-.5-2-2-2-2-.5-2-2 .5-2 2-2 2 .5 2 1"/><path d="M17 11h-2"/></svg>,
  JSON: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M10 12v6"/><path d="M12 16h-4"/></svg>,
  CSS: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400"><path d="M4 4h16v16H4z"/><path d="M10 9l2 3-2 3"/><path d="M14 9v6"/></svg>,
  Default: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-graphite-400"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
};

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'tsx' || ext === 'jsx') return <Icons.React />;
  if (ext === 'ts') return <Icons.TS />;
  if (ext === 'js') return <Icons.JS />;
  if (ext === 'json') return <Icons.JSON />;
  if (ext === 'css') return <Icons.CSS />;
  return <Icons.Default />;
}

// ── Tree Logic ─────────────────────────────────────────────────────────────
type Tree = { [key: string]: Tree | string };

function buildTree(paths: string[]): Tree {
  const root: Tree = {};
  for (const path of paths) {
    const parts = path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = path; // Leaf node stores full path
      } else {
        if (!current[part]) current[part] = {};
        current = current[part] as Tree;
      }
    }
  }
  return root;
}

export default function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  onNewFile,
  onRenameFile,
  onDeleteFile
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]));
  const [creatingFile, setCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const newFileInputRef = useRef<HTMLInputElement>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, path: string } | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const tree = buildTree(files);

  useEffect(() => {
    if (creatingFile && newFileInputRef.current) {
      newFileInputRef.current.focus();
    }
  }, [creatingFile]);

  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [renamingPath]);

  // Click outside context menu
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, path });
  };

  const handleCreateSubmit = (e: React.KeyboardEvent | React.FocusEvent) => {
    if ((e as React.KeyboardEvent).key === "Escape") {
      setCreatingFile(false);
      setNewFileName("");
      return;
    }
    if (e.type === "blur" || (e as React.KeyboardEvent).key === "Enter") {
      if (newFileName.trim()) {
        onNewFile?.(newFileName.trim());
      }
      setCreatingFile(false);
      setNewFileName("");
    }
  };

  const handleRenameSubmit = (e: React.KeyboardEvent | React.FocusEvent) => {
    if ((e as React.KeyboardEvent).key === "Escape") {
      setRenamingPath(null);
      return;
    }
    if (e.type === "blur" || (e as React.KeyboardEvent).key === "Enter") {
      if (renamingPath && renameValue.trim() && renameValue.trim() !== renamingPath) {
        onRenameFile?.(renamingPath, renameValue.trim());
      }
      setRenamingPath(null);
    }
  };

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedFolders(next);
  };

  // Recursive render
  const renderTree = (node: Tree, pathPrefix = "", depth = 0) => {
    const entries = Object.entries(node).sort((a, b) => {
      // Sort folders first
      const aIsFolder = typeof a[1] === 'object';
      const bIsFolder = typeof b[1] === 'object';
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      return a[0].localeCompare(b[0]);
    });

    return entries.map(([name, val]) => {
      const fullPath = pathPrefix ? `${pathPrefix}/${name}` : name;
      const isFolder = typeof val === 'object';

      if (isFolder) {
        const isExpanded = expandedFolders.has(fullPath);
        return (
          <div key={fullPath}>
            <button
              className="w-full text-left py-1.5 text-[13px] flex items-center gap-2 text-graphite-300 hover:bg-graphite-800 hover:text-white transition-colors"
              style={{ paddingLeft: `${depth * 12 + 16}px` }}
              onClick={() => toggleFolder(fullPath)}
            >
              {isExpanded ? <Icons.FolderOpen /> : <Icons.Folder />}
              <span className="truncate">{name}</span>
            </button>
            {isExpanded && renderTree(val as Tree, fullPath, depth + 1)}
          </div>
        );
      } else {
        const isRenaming = renamingPath === fullPath;
        const isActive = fullPath === activeFile && !isRenaming;
        return (
          <div key={fullPath} onContextMenu={(e) => handleContextMenu(e, fullPath)}>
            {isRenaming ? (
              <div 
                className="w-full py-1.5 flex items-center gap-2 bg-graphite-800"
                style={{ paddingLeft: `${depth * 12 + 16}px` }}
              >
                {getFileIcon(name)}
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleRenameSubmit}
                  className="bg-slate-950 border border-cyan-400 text-white text-[13px] font-mono rounded px-1 outline-none w-full mr-2"
                />
              </div>
            ) : (
              <button
                onClick={() => onSelectFile(fullPath)}
                className={`w-full text-left py-1.5 text-[13px] flex items-center gap-2 transition-colors border-l-2 ${
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-300 border-cyan-400" 
                    : "text-graphite-300 hover:bg-graphite-800 hover:text-white border-transparent"
                }`}
                style={{ paddingLeft: `${depth * 12 + 14}px` }} // -2 for the border
              >
                {getFileIcon(name)}
                <span className="truncate font-mono">{name}</span>
              </button>
            )}
          </div>
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-4 h-9 flex justify-between items-center shrink-0 border-b border-graphite-800 bg-graphite-900">
        <span className="text-[11px] font-bold text-graphite-400 tracking-wider uppercase">Explorer</span>
        <div className="flex gap-1">
          <button 
            className="text-graphite-500 hover:text-white hover:bg-graphite-700 p-1 rounded transition-colors" 
            title="New File" 
            onClick={() => setCreatingFile(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {renderTree(tree)}
        
        {creatingFile && (
          <div className="px-4 py-1.5 flex items-center gap-2">
            <Icons.Default />
            <input
              ref={newFileInputRef}
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={handleCreateSubmit}
              onKeyDown={handleCreateSubmit}
              placeholder="filename.js"
              className="bg-graphite-800 border border-cyan-400 text-white text-[13px] font-mono rounded px-1 outline-none w-full"
            />
          </div>
        )}
      </div>

      {contextMenu && (
        <div 
          className="fixed bg-graphite-800 border border-graphite-700 rounded-lg shadow-xl py-1 w-40 z-50 text-[13px] text-graphite-200"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-3 py-1 text-[10px] text-graphite-500 uppercase tracking-wider border-b border-graphite-700 mb-1 truncate">
            {contextMenu.path}
          </div>
          <button 
            className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            onClick={() => {
              setRenamingPath(contextMenu.path);
              setRenameValue(contextMenu.path);
            }}
          >
            Rename
          </button>
          <button 
            className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            onClick={() => {
              // Extract extension to duplicate with suffix
              const parts = contextMenu.path.split('.');
              const ext = parts.length > 1 ? `.${parts.pop()}` : '';
              const base = parts.join('.');
              onNewFile?.(`${base}-copy${ext}`);
            }}
          >
            Duplicate
          </button>
          <button 
            className="w-full text-left px-3 py-1.5 hover:bg-red-500/10 hover:text-red-400 text-red-400 transition-colors"
            onClick={() => {
              onDeleteFile?.(contextMenu.path);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
