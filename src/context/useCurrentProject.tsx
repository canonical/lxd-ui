import type { FC, ReactNode } from "react";
import { createContext, useContext } from "react";
import type { LxdProject } from "types/project";
import { useLocation } from "react-router-dom";
import { useProject } from "./useProjects";
import { useAuth } from "context/auth";

interface ContextProps {
  project?: LxdProject;
  isAllProjects: boolean;
  isLoading: boolean;
}

const initialState: ContextProps = {
  project: undefined,
  isAllProjects: false,
  isLoading: true,
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
  const retry = false;
  const { data, isLoading } = useProject(project, enabled, retry);

  return (
    <ProjectContext.Provider
      value={{
        project: data,
        isAllProjects,
        isLoading: isAuthLoading || isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useCurrentProject() {
  return useContext(ProjectContext);
}
