import type { LxdInstance, LxdInstanceStatus } from "types/instance";
import { configMatchesQuery } from "util/configQuery";

export interface InstanceFilters {
  queries: string[];
  statuses: LxdInstanceStatus[];
  types: string[];
  profiles: string[];
  clusterMembers: string[];
  projects: string[];
}

export const instanceStatuses: LxdInstanceStatus[] = [
  "Running",
  "Stopped",
  "Frozen",
  "Error",
];

export const instanceTypes: string[] = ["Container", "VM"];

export const enrichStatuses = (
  statuses: LxdInstanceStatus[],
): LxdInstanceStatus[] => {
  if (statuses.includes("Frozen")) {
    statuses.push("Freezing");
  }
  if (statuses.includes("Running")) {
    statuses.push(...(["Restarting", "Starting"] as LxdInstanceStatus[]));
  }
  if (statuses.includes("Stopped")) {
    statuses.push("Stopping");
  }

  return statuses;
};

export const instanceMatchesQuery = (
  instance: LxdInstance,
  query: string,
): boolean => {
  const lowerQuery = query.toLowerCase();

  return (
    instance.name.toLowerCase().includes(lowerQuery) ||
    instance.description.toLowerCase().includes(lowerQuery) ||
    !!instance.config["image.description"]
      ?.toLowerCase()
      .includes(lowerQuery) ||
    configMatchesQuery(instance.expanded_config ?? instance.config, lowerQuery)
  );
};
