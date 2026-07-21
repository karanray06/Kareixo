"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Project {
  id: string;
  name: string;
  githubRepo: string | null;
  githubBranch: string | null;
  updatedAt: string;
}

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  setActiveProjectId: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  setIsSaving: (val: boolean) => void;
  refreshProjects: () => Promise<void>;
  
  // File state
  files: Record<string, string>;
  activeFile: string;
  setActiveFile: (path: string) => void;
  updateFile: (path: string, content: string) => Promise<void>;
  createFile: (path: string, content?: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // File state
  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState<string>("");

  const fetchProjects = async () => {
    try {
      setError(null);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !activeProjectId) {
          setActiveProjectId(data[0].id);
        } else if (data.length === 0) {
          // Auto-create default project
          const createRes = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Untitled Project" })
          });
          if (createRes.ok) {
            const newProj = await createRes.json();
            setProjects([newProj]);
            setActiveProjectId(newProj.id);
          } else {
            const errText = await createRes.text();
            console.error("Failed to create project:", errText);
            setError(`Failed to create default project: ${createRes.status} ${errText}`);
          }
        }
      } else {
        const errText = await res.text();
        console.error("Failed to fetch projects:", errText);
        setError(`Failed to load projects: ${res.status} ${errText}`);
      }
    } catch (e: any) {
      console.error("Failed to load projects", e);
      setError(e.message || "Unknown network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFiles = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/files`);
      if (res.ok) {
        const fileList = await res.json();
        const fileMap: Record<string, string> = {};
        let firstPath = "";
        for (const f of fileList) {
          fileMap[f.path] = f.content;
          if (!firstPath || f.path === 'src/index.js' || f.path === 'src/app/page.tsx' || f.path === 'package.json') {
            firstPath = f.path; // Try to pick a sensible default
          }
        }
        setFiles(fileMap);
        if (firstPath) setActiveFile(firstPath);
        else if (fileList.length > 0) setActiveFile(fileList[0].path);
        else setActiveFile("");
      }
    } catch (e) {
      console.error("Failed to load files", e);
    }
  };

  useEffect(() => {
    if (activeProjectId) {
      fetchFiles(activeProjectId);
    } else {
      setFiles({});
      setActiveFile("");
    }
  }, [activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const updateFile = async (path: string, content: string) => {
    setFiles(prev => ({ ...prev, [path]: content }));
    setIsSaving(true);
    try {
      await fetch(`/api/projects/${activeProjectId}/files`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content })
      });
    } catch (e) {
      console.error("Failed to save file", e);
    } finally {
      setIsSaving(false);
    }
  };

  const createFile = async (path: string, content = "") => {
    setFiles(prev => ({ ...prev, [path]: content }));
    setActiveFile(path);
    try {
      await fetch(`/api/projects/${activeProjectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content })
      });
    } catch (e) {
      console.error("Failed to create file", e);
    }
  };

  const deleteFile = async (path: string) => {
    const newFiles = { ...files };
    delete newFiles[path];
    setFiles(newFiles);
    if (activeFile === path) {
      setActiveFile(Object.keys(newFiles)[0] || "");
    }
    try {
      await fetch(`/api/projects/${activeProjectId}/files`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });
    } catch (e) {
      console.error("Failed to delete file", e);
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      setActiveProjectId,
      isLoading,
      error,
      isSaving,
      setIsSaving,
      refreshProjects: fetchProjects,
      files,
      activeFile,
      setActiveFile,
      updateFile,
      createFile,
      deleteFile,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
