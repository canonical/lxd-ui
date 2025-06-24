import type { FC, ReactNode } from "react";
import { createContext, useContext } from "react";
import type { LxdProject } from "types/project";
import { useLocation } from "react-router-dom";
import { useProject } from "./useProjects";
import { useAuth } from "context/auth";

interface ContextProps {
  canViewProject: boolean;
  isAllProjects: boolean;
  isLoading: boolean;
  project?: LxdProject;
}

const initialState: ContextProps = {
  canViewProject: true,
  isAllProjects: false,
  isLoading: true,
  project: undefined,
};

export const ProjectContext = createContext<ContextProps>(initialState);

interface ProviderProps {
  children: ReactNode;
}

export const ProjectProvider: FC<ProviderProps> = ({ children }) => {
  const { isAuthLoading } = useAuth();
  const location = useLocation();
  const url = location.pathname;
  const project = url.startsWith("/ui/project/") ? url.split("/")[3] : "";
  const isAllProjects = url.startsWith("/ui/all-projects/");

  const enabled = project.length > 0 && !isAllProjects;
  const { data, isLoading } = useProject(project, enabled);

  return (
    <ProjectContext.Provider
      value={{
        canViewProject: isLoading || project === "" || data !== undefined,
        isAllProjects,
        isLoading: isAuthLoading || isLoading,
        project: data,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useCurrentProject() {
  return useContext(ProjectContext);
}
