"use client";

import { useProject } from "./ProjectContext";
import { Add, Setting2, ExportSquare, Information, NoteSquare, SecuritySafe, DocumentText, SearchNormal, TaskSquare, ArrowUp2, FolderOpen } from "iconsax-react";
import { useState } from "react";

interface SidebarProps {
  userInitial: string;
  userName: string;
}

export default function Sidebar({ userInitial, userName }: SidebarProps) {
  const { projects, activeProject, setActiveProjectId } = useProject();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Project" })
      });
      if (res.ok) {
        const newProj = await res.json();
        // The ProjectContext doesn't automatically add it to the list without refresh
        // But we can trigger a reload by refreshing the page, or just manually doing it
        window.location.reload(); 
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <aside className="w-[280px] bg-[#141517] border-r border-[#2b2d31] flex flex-col shrink-0 h-full">
      {/* Top Section */}
      <div className="p-4 flex flex-col gap-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-[#202124] p-2 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded bg-coral-500/20 text-coral-400 flex items-center justify-center text-sm font-bold border border-coral-500/30">
            {userInitial}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium text-gray-200 truncate">{userName}</div>
            <div className="text-xs text-gray-500">Free Plan</div>
          </div>
        </div>

        {/* New Session Button */}
        <button 
          onClick={handleCreateProject}
          disabled={isCreating}
          className="flex items-center gap-2 w-full bg-[#202124] hover:bg-[#2b2d31] text-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-[#2b2d31]"
        >
          <Add size={18} variant="Outline" className="text-gray-400" />
          {isCreating ? "Creating..." : "New Project"}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="px-3 pb-2 border-b border-[#2b2d31]/50">
        <nav className="flex flex-col gap-0.5">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors"><TaskSquare size={16} /> Automations</a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors"><SecuritySafe size={16} /> Security</a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors"><DocumentText size={16} /> Review</a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors"><NoteSquare size={16} /> Wiki</a>
        </nav>
      </div>

      {/* Recent Projects */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Projects</span>
          <div className="flex items-center gap-2">
            <SearchNormal size={14} className="cursor-pointer hover:text-gray-300" />
            <span className="cursor-pointer hover:text-gray-300">...</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-0.5">
          {projects.map((project) => {
            const isActive = activeProject?.id === project.id;
            return (
              <div 
                key={project.id} 
                onClick={() => setActiveProjectId(project.id)}
                className={`group flex flex-col px-3 py-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-[#2b2d31]' : 'hover:bg-[#202124]'}`}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen size={14} className={isActive ? "text-coral-400" : "text-gray-500"} variant={isActive ? "Bold" : "Outline"} />
                  <span className={`text-sm truncate ${isActive ? "text-gray-100 font-medium" : "text-gray-300"}`}>
                    {project.name}
                  </span>
                </div>
                {project.githubRepo && (
                  <div className="flex items-center gap-2 mt-1 pl-6">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {project.githubRepo}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {projects.length === 0 && (
            <div className="px-3 py-4 text-xs text-gray-500 text-center">
              No projects yet.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[#2b2d31]/50 bg-[#141517]">
        <div className="flex flex-col gap-0.5">
          <button className="flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors w-full">
            <span className="flex items-center gap-3">
              <ArrowUp2 size={16} /> Upgrade
            </span>
          </button>
          <button className="flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors w-full">
            <span className="flex items-center gap-3">
              <Setting2 size={16} /> Settings
            </span>
          </button>
          <button className="flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors w-full">
            <span className="flex items-center gap-3">
              <ExportSquare size={16} /> Download
            </span>
          </button>
          <button className="flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#202124] rounded-md transition-colors w-full">
            <span className="flex items-center gap-3">
              <Information size={16} /> Help
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
