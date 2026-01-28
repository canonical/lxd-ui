import type { FC, ReactNode } from "react";
import { createContext, useContext } from "react";
import type { LxdProject } from "types/project";
import { useLocation } from "react-router-dom";
import { useProject } from "./useProjects";
import { useAuth } from "context/auth";
import { useSettings } from "context/useSettings";
import { ROOT_PATH } from "util/rootPath";

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
  const { isLoading: isSettingsLoading } = useSettings();
  const { pathname } = useLocation();
  const url = pathname.replace(`${ROOT_PATH}/ui/`, "");

  const parts = url.split("/");
  const project = parts[0] === "project" ? parts[1] : "";
  const isAllProjects = parts[0] === "all-projects";

  const enabled = project?.length > 0 && !isAllProjects;
  const { data, isLoading: isProjectLoading } = useProject(project, enabled);

  return (
    <ProjectContext.Provider
      value={{
        canViewProject:
          isProjectLoading ||
          isSettingsLoading ||
          project === "" ||
          data !== undefined,
        isAllProjects,
        isLoading: isAuthLoading || isProjectLoading || isSettingsLoading,
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
