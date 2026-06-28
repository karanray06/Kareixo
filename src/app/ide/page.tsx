"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import FileExplorer from "@/components/ide/FileExplorer";
import EditorTabs from "@/components/ide/EditorTabs";
import MonacoWrapper from "@/components/ide/MonacoWrapper";
import TerminalPanel from "@/components/ide/TerminalPanel";
import AgentPanel from "@/components/ide/AgentPanel";
import { useProject } from "@/components/ide/ProjectContext";
import {
  Group,
  Panel,
  Separator,
  usePanelRef,
  useDefaultLayout,
} from "react-resizable-panels";

// ── Styled Separator Components ──────────────────────────────────────────────
// Uses `data-separator` attribute from react-resizable-panels for state styling

function VerticalSep({ id }: { id: string }) {
  return (
    <Separator
      id={id}
      className="w-[3px] bg-graphite-800 cursor-col-resize transition-colors
        data-[separator=hover]:bg-cyan-400
        data-[separator=active]:bg-cyan-400"
    />
  );
}

function HorizontalSep({ id }: { id: string }) {
  return (
    <Separator
      id={id}
      className="h-[3px] w-full bg-graphite-800 cursor-row-resize transition-colors
        data-[separator=hover]:bg-cyan-400
        data-[separator=active]:bg-cyan-400"
    />
  );
}

// ── SSR-Safe Storage ───────────────────────────────────────────────────────────
const safeStorage = {
  getItem: (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
};

// ── IDE Page ─────────────────────────────────────────────────────────────────

export default function IdePage() {
  const { activeProject, setIsSaving, error } = useProject();
  const [activeFile, setActiveFile] = useState<string>("");

  const [persistedFiles, setPersistedFiles] = useState<Record<string, string>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Panel refs for imperative resize (double-click-to-reset is built-in)
  const explorerPanelRef = usePanelRef();
  const agentPanelRef = usePanelRef();
  const terminalPanelRef = usePanelRef();

  // Persistence hooks — saves/restores layout from localStorage automatically
  const hLayout = useDefaultLayout({ id: "kareixo-ide-h", storage: safeStorage });
  const vLayout = useDefaultLayout({ id: "kareixo-ide-v", storage: safeStorage });

  // Debounced IDE resize event dispatcher — tells Monaco & xterm to relayout
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatchResize = useCallback(() => {
    if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = setTimeout(() => {
      window.dispatchEvent(new Event("ide-resize"));
    }, 50);
  }, []);

  // Wrap the persistence callbacks to also dispatch resize
  const handleHLayoutChange = useCallback(
    (layout: Record<string, number>) => {
      hLayout.onLayoutChange(layout);
      dispatchResize();
    },
    [hLayout.onLayoutChange, dispatchResize]
  );

  const handleVLayoutChange = useCallback(
    (layout: Record<string, number>) => {
      vLayout.onLayoutChange(layout);
      dispatchResize();
    },
    [vLayout.onLayoutChange, dispatchResize]
  );

  // Load files when project changes
  useEffect(() => {
    if (!activeProject) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/projects/${activeProject.id}/files`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const fileMap: Record<string, string> = {};
        if (Array.isArray(data)) {
          data.forEach((f: { path: string; content?: string }) => {
            fileMap[f.path] = f.content || "";
          });
        }

        // If empty, init with defaults
        if (Object.keys(fileMap).length === 0) {
          fileMap["src/index.js"] =
            "// Kareixo Glass Box IDE\nconsole.log('Hello world');\n";
          fileMap["package.json"] = '{\n  "name": "demo"\n}\n';
          Object.entries(fileMap).forEach(([p, c]) => {
            fetch(`/api/projects/${activeProject.id}/files`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: p, content: c }),
            });
          });
        }

        setPersistedFiles(fileMap);
        setLocalFiles(fileMap);
        setActiveFile(Object.keys(fileMap)[0] || "");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeProject]);

  // Debounced save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!activeProject || isLoading) return;

    const dirtyFiles = Object.keys(localFiles).filter(
      (p) => localFiles[p] !== persistedFiles[p]
    );

    if (dirtyFiles.length === 0) {
      setIsSaving(false);
      return;
    }

    setIsSaving(true);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      Promise.all(
        dirtyFiles.map((path) =>
          fetch(`/api/projects/${activeProject.id}/files`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path, content: localFiles[path] }),
          })
        )
      )
        .then(() => {
          setPersistedFiles((prev) => ({ ...prev, ...localFiles }));
          setIsSaving(false);
        })
        .catch((err) => {
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
    setLocalFiles((prev) => ({ ...prev, [trimmed]: "" }));
    setActiveFile(trimmed);
  };

  const handleApplyChange = (newContent: string) => {
    setLocalFiles((prev) => ({ ...prev, [activeFile]: newContent }));
  };

  const handleFileRename = (oldPath: string, newPath: string) => {
    if (oldPath === newPath || localFiles[newPath] !== undefined) return;

    const newLocal = { ...localFiles };
    newLocal[newPath] = newLocal[oldPath];
    delete newLocal[oldPath];
    setLocalFiles(newLocal);

    if (activeFile === oldPath) setActiveFile(newPath);

    if (activeProject) {
      fetch(
        `/api/projects/${activeProject.id}/files?path=${encodeURIComponent(oldPath)}`,
        { method: "DELETE" }
      );
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
      fetch(
        `/api/projects/${activeProject.id}/files?path=${encodeURIComponent(path)}`,
        { method: "DELETE" }
      );
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-red-400 p-8 text-center gap-4">
        <h2 className="text-xl font-bold">Failed to load IDE</h2>
        <p className="text-sm font-mono bg-red-950/50 p-4 rounded-md border border-red-900/50 max-w-2xl whitespace-pre-wrap">{error}</p>
      </div>
    );
  }

  if (isLoading || !activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-graphite-400">
        Loading IDE...
      </div>
    );
  }

  const isDirty = localFiles[activeFile] !== persistedFiles[activeFile];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Group
        id="kareixo-ide-h"
        orientation="horizontal"
        defaultLayout={hLayout.defaultLayout}
        onLayoutChange={handleHLayoutChange}
        onLayoutChanged={hLayout.onLayoutChanged}
      >
        {/* ── Left: File Explorer ───────────────────────────────── */}
        <Panel
          id="explorer"
          panelRef={explorerPanelRef}
          defaultSize="220px"
          minSize="180px"
          maxSize="480px"
          className="hidden md:flex flex-col bg-graphite-900 overflow-y-auto"
        >
          <FileExplorer
            files={Object.keys(localFiles)}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
            onNewFile={handleAddFile}
            onRenameFile={handleFileRename}
            onDeleteFile={handleFileDelete}
          />
        </Panel>

        <VerticalSep id="sep-explorer-editor" />

        {/* ── Center: Editor + Terminal ─────────────────────────── */}
        <Panel id="center">
          <Group
            id="kareixo-ide-v"
            orientation="vertical"
            defaultLayout={vLayout.defaultLayout}
            onLayoutChange={handleVLayoutChange}
            onLayoutChanged={vLayout.onLayoutChanged}
            style={{ height: "100%", width: "100%" }}
          >
            {/* Editor */}
            <Panel id="editor" defaultSize="75%" minSize="30%">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                  minHeight: 0,
                }}
              >
                <EditorTabs activeFile={activeFile} isDirty={isDirty} />
                <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
                  <MonacoWrapper
                    file={activeFile}
                    content={localFiles[activeFile] || ""}
                    onChange={(val) =>
                      setLocalFiles((prev) => ({
                        ...prev,
                        [activeFile]: val || "",
                      }))
                    }
                  />
                </div>
              </div>
            </Panel>

            <HorizontalSep id="sep-editor-terminal" />

            {/* Terminal */}
            <Panel
              id="terminal"
              panelRef={terminalPanelRef}
              defaultSize="25%"
              minSize="120px"
              maxSize="70vh"
            >
              <TerminalPanel files={localFiles} />
            </Panel>
          </Group>
        </Panel>

        <VerticalSep id="sep-editor-agent" />

        {/* ── Right: Agent Panel ────────────────────────────────── */}
        <Panel
          id="agent"
          panelRef={agentPanelRef}
          defaultSize="340px"
          minSize="280px"
          maxSize="50%"
          className="hidden lg:flex flex-col relative"
        >
          <AgentPanel
            currentFile={activeFile}
            currentContent={localFiles[activeFile] || ""}
            onApplyChange={handleApplyChange}
          />
        </Panel>
      </Group>
    </div>
  );
}
