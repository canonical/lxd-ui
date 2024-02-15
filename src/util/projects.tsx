import { LxdProject } from "types/project";
import { slugify } from "./slugify";

export const storageTabs: string[] = ["Pools", "Volumes", "Custom ISOs"];
export const storageTabPaths = storageTabs.map((tab) => slugify(tab));
export const projectSubpages = [
  "instances",
  "profiles",
  "networks",
  "images",
  "storage",
  "operations",
  "configuration",
];

export const getSubpageFromUrl = (url: string): string | undefined => {
  const parts = url.split("/");

  const mainSubpage = parts[4];
  const tabSubpage = parts[5];

  if (mainSubpage === "storage" && storageTabPaths.includes(tabSubpage)) {
    return `${mainSubpage}/${tabSubpage}`;
  }

  if (projectSubpages.includes(mainSubpage)) {
    return mainSubpage;
  }

  return undefined;
};

export const isProjectEmpty = (project: LxdProject): boolean => {
  if (!project.used_by) {
    return true;
  }

  const defaultProfile = `/1.0/profiles/default?project=${project.name}`;
  return !project.used_by.some((item) => item !== defaultProfile);
};

export const isProjectWithProfiles = (project?: LxdProject): boolean =>
  project?.config["features.profiles"] === "true";
