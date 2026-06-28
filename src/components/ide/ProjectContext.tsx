"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Project {
  id: string;
  name: string;
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
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      setActiveProjectId,
      isLoading,
      error,
      isSaving,
      setIsSaving,
      refreshProjects: fetchProjects
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
