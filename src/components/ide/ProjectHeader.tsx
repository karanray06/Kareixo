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
    return <span className="font-display font-medium text-sm text-dusk-500">Loading...</span>;
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
            className="bg-cream-200 border border-coral-400 text-dusk-900 text-sm font-display font-medium rounded px-2 py-0.5 outline-none w-48"
          />
        ) : (
          <div 
            className="flex items-center gap-1 cursor-pointer group rounded px-2 py-0.5 hover:bg-cream-200 transition-colors"
            onClick={() => setIsEditing(true)}
          >
            <span className="font-display font-medium text-sm text-dusk-900 group-hover:text-dusk-900 transition-colors">
              {activeProject.name}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dusk-500 group-hover:text-dusk-700">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
        )}

        {/* Project Switcher */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded text-dusk-500 hover:text-dusk-900 hover:bg-cream-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute top-full mt-1 left-0 w-48 bg-cream-200 border border-cream-300 rounded-lg shadow-xl z-50 overflow-hidden py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-dusk-500 uppercase tracking-wider border-b border-cream-300">
                Your Projects
              </div>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-cream-300 transition-colors ${p.id === activeProject.id ? 'text-coral-300 bg-coral-400/5' : 'text-dusk-700'}`}
                >
                  <span className="truncate">{p.name}</span>
                  {p.id === activeProject.id && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-coral-400 shrink-0">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-4 w-px bg-cream-300" />
      
      {/* Saving Indicator */}
      <div className="flex items-center gap-1.5">
        {isSaving ? (
          <>
            <div className="w-3 h-3 border border-dusk-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-mono text-dusk-500">Saving...</span>
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dusk-500">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span className="text-[10px] font-mono text-dusk-500">Saved</span>
          </>
        )}
      </div>
    </div>
  );
}
