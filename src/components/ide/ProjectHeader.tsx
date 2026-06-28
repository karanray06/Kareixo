"use client";

import { useState, useRef, useEffect } from "react";
import { useProject } from "./ProjectContext";

export default function ProjectHeader() {
  const { activeProject, projects, setActiveProjectId, isSaving, refreshProjects } = useProject();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeProject) {
      setEditName(activeProject.name);
    }
  }, [activeProject]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveName = async () => {
    setIsEditing(false);
    if (!activeProject || !editName.trim() || editName === activeProject.name) return;

    try {
      await fetch(`/api/projects/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() })
      });
      await refreshProjects();
    } catch (e) {
      console.error("Failed to rename project", e);
    }
  };

  if (!activeProject) {
    return <span className="font-display font-medium text-sm text-graphite-400">Loading...</span>;
  }

  return (
    <div className="flex items-center gap-3 relative">
      <div className="flex items-center">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName();
              if (e.key === "Escape") {
                setEditName(activeProject.name);
                setIsEditing(false);
              }
            }}
            className="bg-graphite-800 border border-cyan-400 text-white text-sm font-display font-medium rounded px-2 py-0.5 outline-none w-48"
          />
        ) : (
          <div 
            className="flex items-center gap-1 cursor-pointer group rounded px-2 py-0.5 hover:bg-graphite-800 transition-colors"
            onClick={() => setIsEditing(true)}
          >
            <span className="font-display font-medium text-sm text-graphite-100 group-hover:text-white transition-colors">
              {activeProject.name}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-graphite-500 group-hover:text-graphite-300">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
        )}

        {/* Project Switcher */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded text-graphite-500 hover:text-white hover:bg-graphite-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute top-full mt-1 left-0 w-48 bg-graphite-800 border border-graphite-700 rounded-lg shadow-xl z-50 overflow-hidden py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-graphite-400 uppercase tracking-wider border-b border-graphite-700">
                Your Projects
              </div>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-graphite-700 transition-colors ${p.id === activeProject.id ? 'text-cyan-300 bg-cyan-400/5' : 'text-graphite-200'}`}
                >
                  <span className="truncate">{p.name}</span>
                  {p.id === activeProject.id && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400 shrink-0">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-4 w-px bg-graphite-700" />
      
      {/* Saving Indicator */}
      <div className="flex items-center gap-1.5">
        {isSaving ? (
          <>
            <div className="w-3 h-3 border border-graphite-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-mono text-graphite-400">Saving...</span>
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-graphite-500">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span className="text-[10px] font-mono text-graphite-500">Saved</span>
          </>
        )}
      </div>
    </div>
  );
}
