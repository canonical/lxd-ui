import type { FC, ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { LxdProject } from "types/project";
import { useLocation } from "react-router-dom";
import { useProject } from "context/useProjects";
import { useAuth } from "context/auth";
import { useSettings } from "context/useSettings";
import { ROOT_PATH } from "util/rootPath";
import { ALL_PROJECTS } from "util/projects";

interface ContextProps {
  canViewProject: boolean;
  isAllProjects: boolean;
  isLoading: boolean;
  project?: LxdProject;
  projectName: string;
  setProjectName: (name: string) => void;
}

const initialState: ContextProps = {
  canViewProject: true,
  isAllProjects: false,
  isLoading: true,
  project: undefined,
  projectName: "default",
  setProjectName: () => {},
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

  const initializeProjectName = (
    isAllProjectsFromUrl: boolean,
    isLoading: boolean,
    project: LxdProject | undefined,
    urlProject: string,
  ) => {
    if (isAllProjectsFromUrl) {
      return ALL_PROJECTS;
    }

    // Always use the actual project name from loaded data if available
    if (project && !isLoading) {
      return project.name;
    }

    // Fall back to URL project name when loading or when data is not available
    if (urlProject) {
      return urlProject;
    }

    return "default";
  };

  const [projectName, setProjectName] = useState<string>(() =>
    initializeProjectName(isAllProjects, true, undefined, project),
  );

  // Determine which project to fetch data for:
  // 1. If URL has a project, use that
  // 2. If no URL project but projectName is set and not ALL_PROJECTS, use projectName
  // 3. Otherwise, don't fetch
  const projectToFetch =
    project || (projectName !== ALL_PROJECTS ? projectName : "");
  const enabled = projectToFetch?.length > 0 && !isAllProjects;
  const { data, isLoading: isProjectLoading } = useProject(
    projectToFetch,
    enabled,
  );

  const isLoading = isProjectLoading || isSettingsLoading;

  // Initialize projectName based on current state
  useEffect(() => {
    const newProjectName = initializeProjectName(
      isAllProjects,
      isLoading,
      data,
      project,
    );
    if (newProjectName !== projectName) {
      setProjectName(newProjectName);
    }
  }, [project, isAllProjects, isLoading, data, projectName]);

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
        projectName,
        setProjectName,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useCurrentProject() {
  return useContext(ProjectContext);
}
