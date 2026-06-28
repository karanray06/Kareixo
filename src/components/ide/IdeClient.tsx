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

function VerticalSep({ id }: { id: string }) {
  return (
    <Separator
      id={id}
      className="w-[3px] bg-cream-200 cursor-col-resize transition-colors
        data-[separator=hover]:bg-coral-400
        data-[separator=active]:bg-coral-400"
    />
  );
}

function HorizontalSep({ id }: { id: string }) {
  return (
    <Separator
      id={id}
      className="h-[3px] w-full bg-cream-200 cursor-row-resize transition-colors
        data-[separator=hover]:bg-coral-400
        data-[separator=active]:bg-coral-400"
    />
  );
}

// ── SSR-Safe Storage (runs client-side only) ────────────────────────────────
const safeStorage = {
  getItem: (key: string) => {
    try {
      const val = localStorage.getItem(key);
      if (!val) return null;
      JSON.parse(val); // validate JSON before handing it to the library
      return val;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
};

// ── IDE Client ───────────────────────────────────────────────────────────────
// This component is always loaded client-side only (ssr: false in page.tsx).

export default function IdeClient() {
  const { activeProject, setIsSaving, error } = useProject();
  const [activeFile, setActiveFile] = useState<string>("");

  const [persistedFiles, setPersistedFiles] = useState<Record<string, string>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Panel refs for imperative resize
  const explorerPanelRef = usePanelRef();
  const agentPanelRef = usePanelRef();
  const terminalPanelRef = usePanelRef();

  // Persistence hooks — save/restore layout sizes from localStorage
  const hLayout = useDefaultLayout({ id: "ide-h-v4", storage: safeStorage });
  const vLayout = useDefaultLayout({ id: "ide-v-v4", storage: safeStorage });

  // Debounced resize event to trigger Monaco + xterm relayout
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatchResize = useCallback(() => {
    if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = setTimeout(() => {
      window.dispatchEvent(new Event("ide-resize"));
    }, 50);
  }, []);

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

  // Debounced auto-save
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
      <div className="flex-1 flex flex-col items-center justify-center bg-cream-50 text-red-400 p-8 text-center gap-4">
        <h2 className="text-xl font-bold">Failed to load IDE</h2>
        <p className="text-sm font-mono bg-red-950/50 p-4 rounded-md border border-red-900/50 max-w-2xl whitespace-pre-wrap">{error}</p>
      </div>
    );
  }

  if (isLoading || !activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cream-50 text-dusk-500">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-dusk-400 border-t-coral-400 rounded-full animate-spin" />
          Loading IDE...
        </div>
      </div>
    );
  }

  const isDirty = localFiles[activeFile] !== persistedFiles[activeFile];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Group
        id="ide-h-v4"
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
          className="hidden md:flex flex-col bg-cream-100 overflow-y-auto"
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
            id="ide-v-v4"
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
            projectId={activeProject.id}
            localFiles={localFiles}
            currentFile={activeFile}
            currentContent={localFiles[activeFile] || ""}
            onApplyChange={handleApplyChange}
            onUpdateFile={(path, content) => setLocalFiles(prev => ({ ...prev, [path]: content }))}
          />
        </Panel>
      </Group>
    </div>
  );
}
