"use client";

import { useState } from "react";
import FileExplorer from "@/components/ide/FileExplorer";
import EditorTabs from "@/components/ide/EditorTabs";
import MonacoWrapper from "@/components/ide/MonacoWrapper";
import SessionTimeline from "@/components/ide/SessionTimeline";
import TerminalPanel from "@/components/ide/TerminalPanel";
import AgentPanel from "@/components/ide/AgentPanel";

export default function IdePage() {
  const [activeFile, setActiveFile] = useState<string>("src/index.js");
  const [files, setFiles] = useState<Record<string, string>>({
    "src/index.js": "// Kareixo Glass Box IDE\nconsole.log('Hello world');\n",
    "package.json": '{\n  "name": "demo"\n}\n',
  });

  const handleAddFile = () => {
    const name = window.prompt("New file name (e.g. src/utils.js):");
    if (!name || name.trim() === "") return;
    const trimmed = name.trim();
    setFiles((prev) => ({ ...prev, [trimmed]: "" }));
    setActiveFile(trimmed);
  };

  const handleApplyChange = (newContent: string) => {
    setFiles((prev) => ({ ...prev, [activeFile]: newContent }));
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Top section: Explorer + Editor + Agent */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: File Explorer */}
        <div className="w-[var(--sidebar-width)] border-r border-graphite-700 flex flex-col shrink-0 bg-graphite-900 overflow-y-auto">
          <FileExplorer
            files={Object.keys(files)}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
            onNewFile={handleAddFile}
          />
        </div>

        {/* Center: Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          <EditorTabs activeFile={activeFile} />
          <div className="flex-1 relative">
            <MonacoWrapper
              file={activeFile}
              content={files[activeFile] || ""}
              onChange={(val) => setFiles((prev) => ({ ...prev, [activeFile]: val || "" }))}
            />
          </div>
        </div>

        {/* Right: Agent Panel */}
        <div className="w-[var(--panel-width)] shrink-0 flex flex-col relative">
          <AgentPanel
            currentFile={activeFile}
            currentContent={files[activeFile] || ""}
            onApplyChange={handleApplyChange}
          />
          <SessionTimeline />
        </div>
      </div>

      {/* Bottom: Terminal */}
      <TerminalPanel files={files} />
    </div>
  );
}
