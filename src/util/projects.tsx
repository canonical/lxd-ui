import { updateProjectReplicaMode } from "api/projects";
import { waitForOperation } from "api/operations";
import { ALL_INSTANCES_LIST_URL } from "util/instances";
import { pluralize } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import { slugify } from "util/slugify";
import type { LxdProject, ProjectReplicaMode } from "types/project";

export const ALL_PROJECTS = "All projects";
export const ALL_PROJECTS_OVERVIEW_PATH = `${ROOT_PATH}/ui/all-projects/overview`;

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
  "overview",
];

export const getOverviewUrl = (projectName: string): string => {
  if (projectName === ALL_PROJECTS) {
    return ALL_PROJECTS_OVERVIEW_PATH;
  }
  return `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/overview`;
};

export const getInstancesUrl = (projectName: string): string => {
  if (projectName === ALL_PROJECTS) {
    return ALL_INSTANCES_LIST_URL;
  }
  return `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/instances`;
};

export const getHomeUrl = (
  projectName: string,
  isOverviewEnabled: boolean,
): string => {
  return isOverviewEnabled
    ? getOverviewUrl(projectName)
    : getInstancesUrl(projectName);
};

export const getSubpageFromUrl = (url: string): string | undefined => {
  const urlWithoutQuery = url.split("?")[0];
  const normalizedPath = urlWithoutQuery.replace(ROOT_PATH, "");
  const parts = normalizedPath.split("/");

  const subpageIndex = parts[2] === "all-projects" ? 3 : 4;
  const mainSubpage = parts[subpageIndex];
  const tabSubpage = parts[subpageIndex + 1];

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

export const getProjectSwitchTarget = (
  url: string,
  projectName: string,
): string => {
  const urlWithoutQuery = url.split("?")[0];

  if (
    urlWithoutQuery.includes("/ui/image-registry/") ||
    urlWithoutQuery.includes("/ui/image-registries")
  ) {
    return `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/instances`;
  }

  const targetSection = getSubpageFromUrl(url) ?? "instances";
  return `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/${targetSection}`;
};

export const getAllProjectsSwitchTarget = (
  url: string,
  isOverviewEnabled: boolean,
): string => {
  const targetSection = getSubpageFromUrl(url);

  if (targetSection === "overview" && isOverviewEnabled) {
    return ALL_PROJECTS_OVERVIEW_PATH;
  }

  if (targetSection === "instances") {
    return ALL_INSTANCES_LIST_URL;
  }

  return getHomeUrl(ALL_PROJECTS, isOverviewEnabled);
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

export const isProjectReplicaModeStandby = (project?: LxdProject): boolean =>
  project?.replica_mode === "standby";

export const getInstancesUsedByProject = (project: LxdProject): string[] => {
  if (!project.used_by) {
    return [];
  }

  return project.used_by.filter((item) => item.startsWith("/1.0/instances/"));
};

export const getInstanceCount = (project: LxdProject): string => {
  const count = getInstancesUsedByProject(project).length;
  return `${count} ${pluralize("instance", count)}`;
};

export const updateReplicaMode = async (
  project: string,
  mode: ProjectReplicaMode,
  onSuccess: () => void,
  onFailure: (e: unknown) => void,
  force?: boolean,
) => {
  try {
    const operation = await updateProjectReplicaMode(project, mode, force);
    const operationId = operation?.metadata?.id;
    if (!operationId) {
      onFailure(new Error("Operation id missing"));
      return;
    }
    await waitForOperation(operationId);
    onSuccess();
  } catch (e) {
    onFailure(e as Error);
  }
};
