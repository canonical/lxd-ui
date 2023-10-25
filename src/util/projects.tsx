import { STORAGE_TAB_PATHS } from "pages/storage/Storage";
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

  const mainSubpage = parts[4];
  const tabSubpage = parts[5];

  if (mainSubpage === "storage" && STORAGE_TAB_PATHS.includes(tabSubpage)) {
    return `${mainSubpage}/${tabSubpage}`;
  }

  if (projectSubpages.includes(mainSubpage)) {
    return mainSubpage;
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
