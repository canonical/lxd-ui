import type { LxdProject } from "types/project";
import { slugify } from "./slugify";
import { ROOT_PATH } from "util/rootPath";

export const storageTabs: string[] = [
  "Pools",
  "Volumes",
  "Custom ISOs",
  "Buckets",
];
export const storageTabPaths = storageTabs.map((tab) => slugify(tab));
export const projectSubpages = [
  "instances",
  "profiles",
  "network-acls",
  "network-ipam",
  "networks",
  "images",
  "storage",
  "operations",
  "configuration",
];

export const getSubpageFromUrl = (url: string): string | undefined => {
  const urlWithoutQuery = url.split("?")[0];
  const normalizedPath = urlWithoutQuery.replace(ROOT_PATH, "");
  const parts = normalizedPath.split("/");

  const mainSubpage = parts[4];
  const tabSubpage = parts[5];

  if (mainSubpage === "storage" && storageTabPaths.includes(tabSubpage)) {
    return `${encodeURIComponent(mainSubpage)}/${encodeURIComponent(tabSubpage)}`;
  }

  if (mainSubpage === "network") {
    return "networks";
  }

  if (mainSubpage === "storage") {
    return "storage/pools";
  }

  if (projectSubpages.includes(mainSubpage)) {
    return encodeURIComponent(mainSubpage);
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

export const isProjectWithVolumes = (project?: LxdProject): boolean =>
  project?.config["features.storage.volumes"] === "true";
