"use client";

import { useProject } from "./ProjectContext";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import FileExplorer from "./FileExplorer";
import MonacoWrapper from "./MonacoWrapper";
import AgentPanel from "./AgentPanel";
import EditorTabs from "./EditorTabs";
import { Add, CloseCircle, TickCircle } from "iconsax-react";
import { useState, useEffect } from "react";

export default function IdeClient() {
  const [showChecklist, setShowChecklist] = useState(true);
  const { 
    activeProject, 
    files, 
    activeFile, 
    setActiveFile, 
    updateFile,
    createFile,
    deleteFile,
    isLoading 
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
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1a1b1e] text-gray-500">
        <div className="w-16 h-16 bg-[#2b2d31] rounded-full flex items-center justify-center mb-4">
          <Add size={32} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-medium text-gray-300 mb-2">No active project</h2>
        <p className="text-sm">Create or select a project from the sidebar to get started.</p>
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
