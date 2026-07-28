"use client";

import { useProject } from "./ProjectContext";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import FileExplorer from "./FileExplorer";
import MonacoWrapper from "./MonacoWrapper";
import AgentPanel from "./AgentPanel";
import EditorTabs from "./EditorTabs";
import { Add, CloseCircle, TickCircle, SearchNormal1 } from "iconsax-react";
import { FaGithub } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function IdeClient() {
  const [showChecklist, setShowChecklist] = useState(true);
  const [importRepo, setImportRepo] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const { 
    activeProject, 
    files, 
    activeFile, 
    setActiveFile, 
    updateFile,
    createFile,
    deleteFile,
    isLoading,
    importProject
  } = useProject();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1a1b1e] text-gray-500">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-dusk-400 border-t-coral-400 rounded-full animate-spin" />
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1a1b1e] text-gray-500 p-8">
        <div className="max-w-md w-full bg-[#141517] border border-[#2b2d31] rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#2b2d31] rounded-2xl flex items-center justify-center mb-6 border border-white/5">
            <FaGithub className="text-white/80" size={32} />
          </div>
          <h2 className="text-2xl font-medium text-gray-200 mb-3 font-display">Import from GitHub</h2>
          <p className="text-sm text-gray-400 mb-8">
            Enter a public repository to instantly load it into Kareixo's agentic workspace.
          </p>
          
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (!importRepo) return;
              setIsImporting(true);
              setImportError(null);
              try {
                await importProject(importRepo);
              } catch (err: any) {
                setImportError(err.message);
              } finally {
                setIsImporting(false);
              }
            }}
            className="w-full space-y-4"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchNormal1 size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="e.g. vercel/next.js"
                value={importRepo}
                onChange={(e) => setImportRepo(e.target.value)}
                disabled={isImporting}
                className="w-full bg-[#1a1b1e] border border-[#2b2d31] text-gray-200 text-sm rounded-xl focus:ring-1 focus:ring-coral-500 focus:border-coral-500 block pl-11 p-3.5 transition-colors disabled:opacity-50"
              />
            </div>
            
            {importError && (
              <div className="text-red-400 text-sm text-left p-3 bg-red-400/10 rounded-lg border border-red-400/20">
                {importError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={!importRepo || isImporting}
              className="w-full text-white bg-coral-500 hover:bg-coral-400 focus:ring-4 focus:ring-coral-500/20 font-medium rounded-xl text-sm px-5 py-3.5 text-center transition-all disabled:opacity-50 disabled:hover:bg-coral-500 flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Project"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1a1b1e] overflow-hidden">
      {/* Top Header */}
      <div className="h-12 border-b border-[#2b2d31] flex items-center px-4 bg-[#141517] shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-coral-400/20 border border-coral-400/40 glow-cyan">
            <div className="w-2 h-2 border border-coral-300 transform rotate-45" />
          </div>
          <span className="font-display font-bold text-gray-200">Kareixo</span>
          <span className="text-gray-500 ml-2 text-sm">/ {activeProject.name}</span>
        </div>
      </div>

      <PanelGroup orientation="horizontal" className="flex-1">
        {/* Left Pane: File Explorer */}
        <Panel defaultSize={20} minSize={15}>
          <FileExplorer 
            files={Object.keys(files)}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
            onNewFile={(path) => createFile(path)}
            onDeleteFile={deleteFile}
          />
        </Panel>

        <PanelResizeHandle className="w-1 bg-[#2b2d31] hover:bg-coral-500/50 transition-colors" />

        {/* Middle Pane: Editor */}
        <Panel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full bg-[#1e1e1e]">
            {activeFile ? (
              <>
                <EditorTabs 
                  activeFile={activeFile}
                  isDirty={false}
                />
                <div className="flex-1 relative">
                  <MonacoWrapper
                    file={activeFile}
                    content={files[activeFile] || ""}
                    onChange={(val) => updateFile(activeFile, val ?? "")}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a file to edit
              </div>
            )}
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-[#2b2d31] hover:bg-coral-500/50 transition-colors" />

        {/* Right Pane: Agent */}
        <Panel defaultSize={30} minSize={20}>
          <AgentPanel
            projectId={activeProject.id}
            githubRepo={activeProject.githubRepo}
            githubBranch={activeProject.githubBranch}
            localFiles={files}
            currentFile={activeFile}
            currentContent={files[activeFile] || ""}
            onApplyChange={(content) => updateFile(activeFile, content)}
            onUpdateFile={(path, content) => updateFile(path, content)}
          />
        </Panel>
      </PanelGroup>

      {/* Onboarding Checklist */}
      {showChecklist && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-96 bg-[#141517] border border-[#2b2d31] rounded-xl shadow-xl overflow-hidden animate-fade-in-up z-50">
          <div className="p-3 border-b border-[#2b2d31] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-200">Get started</span>
              <span className="text-xs text-gray-500">
                {activeProject ? (activeProject.githubRepo ? "3 of 3" : "2 of 3") : "1 of 3"}
              </span>
            </div>
            <button onClick={() => setShowChecklist(false)} className="text-gray-500 hover:text-gray-300">
              <CloseCircle size={16} />
            </button>
          </div>
          <div className="h-1 bg-[#2b2d31]">
            <div className="h-full bg-coral-500 transition-all" style={{ width: activeProject ? (activeProject.githubRepo ? "100%" : "66%") : "33%" }} />
          </div>
          <div className="flex flex-col p-2">
            <div className={`flex items-center gap-3 p-2 text-sm ${activeProject ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
              {activeProject ? (
                <TickCircle size={18} className="text-coral-500" variant="Bold" />
              ) : (
                <div className="w-[18px] h-[18px] rounded-full border border-gray-500" />
              )}
              Create your first project
            </div>
            
            <div className={`flex items-center gap-3 p-2 text-sm ${Object.keys(files).length > 0 ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
              {Object.keys(files).length > 0 ? (
                <TickCircle size={18} className="text-coral-500" variant="Bold" />
              ) : (
                <div className="w-[18px] h-[18px] rounded-full border border-gray-500" />
              )}
              Create or edit a file
            </div>
            
            <div className={`flex items-center justify-between p-2 text-sm ${activeProject?.githubRepo ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
              <div className="flex items-center gap-3">
                {activeProject?.githubRepo ? (
                  <TickCircle size={18} className="text-coral-500" variant="Bold" />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border border-gray-500" />
                )}
                Connect to a GitHub repository
              </div>
              <span className="text-xs text-green-400 border border-green-400/20 bg-green-400/10 px-1.5 py-0.5 rounded">Earned $10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
