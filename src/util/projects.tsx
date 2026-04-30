import type { LxdProject } from "types/project";
import { slugify } from "./slugify";
import { ROOT_PATH } from "util/rootPath";

export const ALL_PROJECTS = "All projects";

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
  "local-images",
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

export const isGlobalPage = (url: string): boolean => {
  const urlWithoutQuery = url.split("?")[0];
  const globalPages = [
    "/ui/server",
    "/ui/cluster",
    "/ui/operations",
    "/ui/warnings",
    "/ui/permissions",
    "/ui/settings",
    "/ui/image-registries",
    "/ui/image-registry/",
  ];

  return globalPages.some((page) => urlWithoutQuery.includes(page));
};

export const getProjectSwitchTarget = (
  url: string,
  projectName: string,
): string => {
  if (isGlobalPage(url)) {
    return url;
  }

  const targetSection = getSubpageFromUrl(url) ?? "instances";
  return `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/${targetSection}`;
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
