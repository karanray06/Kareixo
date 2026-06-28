"use client";

import { useState, useEffect, useRef } from "react";
import FileExplorer from "@/components/ide/FileExplorer";
import EditorTabs from "@/components/ide/EditorTabs";
import MonacoWrapper from "@/components/ide/MonacoWrapper";
import TerminalPanel from "@/components/ide/TerminalPanel";
import AgentPanel from "@/components/ide/AgentPanel";
import { useProject } from "@/components/ide/ProjectContext";

export default function IdePage() {
  const { activeProject, setIsSaving } = useProject();
  const [activeFile, setActiveFile] = useState<string>("");
  
  const [persistedFiles, setPersistedFiles] = useState<Record<string, string>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load files when project changes
  useEffect(() => {
    if (!activeProject) return;
    
    let isMounted = true;
    setIsLoading(true);
    
    fetch(`/api/projects/${activeProject.id}/files`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const fileMap: Record<string, string> = {};
        if (Array.isArray(data)) {
          data.forEach((f: any) => {
            fileMap[f.path] = f.content || "";
          });
        }
        
        // If empty, init with some defaults
        if (Object.keys(fileMap).length === 0) {
          fileMap["src/index.js"] = "// Kareixo Glass Box IDE\nconsole.log('Hello world');\n";
          fileMap["package.json"] = '{\n  "name": "demo"\n}\n';
          // auto-save defaults
          Object.entries(fileMap).forEach(([p, c]) => {
            fetch(`/api/projects/${activeProject.id}/files`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: p, content: c })
            });
          });
        }
        
        setPersistedFiles(fileMap);
        setLocalFiles(fileMap);
        setActiveFile(Object.keys(fileMap)[0] || "");
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [activeProject]);

  // Debounced save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!activeProject || isLoading) return;
    
    // Find what changed
    const dirtyFiles = Object.keys(localFiles).filter(
      p => localFiles[p] !== persistedFiles[p]
    );
    
    if (dirtyFiles.length === 0) {
      setIsSaving(false);
      return;
    }
    
    setIsSaving(true);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      // Save all dirty files
      Promise.all(dirtyFiles.map(path => 
        fetch(`/api/projects/${activeProject.id}/files`, {
          method: "POST", // The POST endpoint in our API handles upsert
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, content: localFiles[path] })
        })
      )).then(() => {
        setPersistedFiles(prev => ({ ...prev, ...localFiles }));
        setIsSaving(false);
      }).catch(err => {
        console.error("Save failed", err);
        setIsSaving(false);
      });
    }, 1000);
    
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [localFiles, persistedFiles, activeProject, isLoading, setIsSaving]);

  const handleAddFile = (path: string) => {
    if (!path.trim() || localFiles[path] !== undefined) return;
    const trimmed = path.trim();
    setLocalFiles(prev => ({ ...prev, [trimmed]: "" }));
    setActiveFile(trimmed);
  };

  const handleApplyChange = (newContent: string) => {
    setLocalFiles(prev => ({ ...prev, [activeFile]: newContent }));
  };

  const handleFileRename = (oldPath: string, newPath: string) => {
    if (oldPath === newPath || localFiles[newPath] !== undefined) return;
    
    const newLocal = { ...localFiles };
    newLocal[newPath] = newLocal[oldPath];
    delete newLocal[oldPath];
    setLocalFiles(newLocal);
    
    if (activeFile === oldPath) setActiveFile(newPath);
    
    if (activeProject) {
      fetch(`/api/projects/${activeProject.id}/files?path=${encodeURIComponent(oldPath)}`, {
        method: "DELETE"
      });
      // The new path will be picked up by the debounce saver
    }
  };

  const handleFileDelete = (path: string) => {
    const newLocal = { ...localFiles };
    delete newLocal[path];
    setLocalFiles(newLocal);
    
    if (activeFile === path) {
      setActiveFile(Object.keys(newLocal)[0] || "");
    }
    
    if (activeProject) {
      fetch(`/api/projects/${activeProject.id}/files?path=${encodeURIComponent(path)}`, {
        method: "DELETE"
      });
    }
  };

  if (isLoading || !activeProject) {
    return <div className="flex-1 flex items-center justify-center bg-slate-950 text-graphite-400">Loading IDE...</div>;
  }

  const isDirty = localFiles[activeFile] !== persistedFiles[activeFile];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Top section: Explorer + Editor + Agent */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: File Explorer */}
        <div className="w-[var(--sidebar-width)] hidden md:flex border-r border-graphite-700 flex-col shrink-0 bg-graphite-900 overflow-y-auto">
          <FileExplorer
            files={Object.keys(localFiles)}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
            onNewFile={handleAddFile}
            onRenameFile={handleFileRename}
            onDeleteFile={handleFileDelete}
          />
        </div>

        {/* Center: Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          <EditorTabs activeFile={activeFile} isDirty={isDirty} />
          <div className="flex-1 relative">
            <MonacoWrapper
              file={activeFile}
              content={localFiles[activeFile] || ""}
              onChange={(val) => setLocalFiles((prev) => ({ ...prev, [activeFile]: val || "" }))}
            />
          </div>
        </div>

        {/* Right: Agent Panel */}
        <div className="w-[var(--panel-width)] hidden lg:flex shrink-0 flex-col relative">
          <AgentPanel
            currentFile={activeFile}
            currentContent={localFiles[activeFile] || ""}
            onApplyChange={handleApplyChange}
          />
        </div>
      </div>

      {/* Bottom: Terminal */}
      <TerminalPanel files={localFiles} />
    </div>
  );
}
