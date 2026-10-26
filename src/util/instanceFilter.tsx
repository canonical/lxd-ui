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

const NEGATION_PREFIX = "!";

const matchesQuery = (instance: LxdInstance, lowerQuery: string): boolean => {
  return (
    instance.name.toLowerCase().includes(lowerQuery) ||
    instance.description.toLowerCase().includes(lowerQuery) ||
    !!instance.config["image.description"]
      ?.toLowerCase()
      .includes(lowerQuery) ||
    configMatchesQuery(instance.expanded_config ?? instance.config, lowerQuery)
  );
};

// A query starting with "!" matches the instances that don't match the rest
// of the query, e.g. "!user.backup=daily".
export const instanceMatchesQuery = (
  instance: LxdInstance,
  query: string,
): boolean => {
  const lowerQuery = query.toLowerCase();
  const isNegated =
    lowerQuery.startsWith(NEGATION_PREFIX) &&
    lowerQuery.length > NEGATION_PREFIX.length;

  if (isNegated) {
    return !matchesQuery(instance, lowerQuery.slice(NEGATION_PREFIX.length));
  }

  return matchesQuery(instance, lowerQuery);
};
