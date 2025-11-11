import type { LxdProject } from "types/project";

export const ALL_PROJECTS = "__all_projects__";
const LOCAL_STORAGE_KEY = "lxdLoginProject";

export const loadLoginProject = (): string | undefined => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  return saved || undefined;
};

export const saveLoginProject = (project: string): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, project);
};

export const getDefaultProject = (projects: LxdProject[]) => {
  const project =
    projects.length < 1 || projects.find((p) => p.name === "default")
      ? "default"
      : projects[0].name;

  return project;
};

export const getLoginProject = (projects: LxdProject[]) => {
  const savedProject = loadLoginProject();
  if (savedProject === ALL_PROJECTS) {
    return ALL_PROJECTS;
  }
  if (savedProject && projects.find((p) => p.name === savedProject)) {
    return savedProject;
  }

  return getDefaultProject(projects);
};
