import { LxdProject } from "types/project";

export const projectSubpages = [
  "instances",
  "profiles",
  "networks",
  "images",
  "storage",
  "operations",
  "configuration",
];

export const getSubpageFromUrl = (url: string) => {
  const parts = url.split("/");
  if (projectSubpages.includes(parts[4])) {
    return parts[4];
  }
  return undefined;
};

export const isProjectEmpty = (project: LxdProject) => {
  if (!project.used_by) {
    return true;
  }

  const defaultProfile = `/1.0/profiles/default?project=${project.name}`;
  return !project.used_by.some((item) => item !== defaultProfile);
};

export const isProjectWithProfiles = (project?: LxdProject) =>
  project?.config["features.profiles"] === "true";
