import type { LxdInstance, LxdInstanceStatus } from "types/instance";

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

// Supports the config filters of lxc list, e.g. "user.owner=alice".
// Like in lxc list, an empty value matches instances where the key is not set.
const matchesConfigQuery = (instance: LxdInstance, query: string): boolean => {
  const [key, ...valueParts] = query.split("=");
  const configKey = key.trim();
  if (!configKey || valueParts.length === 0) {
    return false;
  }

  const config = instance.expanded_config ?? instance.config;
  const matchingKey = Object.keys(config).find(
    (item) => item.toLowerCase() === configKey,
  );
  const configValue = matchingKey ? (config[matchingKey] ?? "") : "";

  return configValue.toLowerCase() === valueParts.join("=").trim();
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
    matchesConfigQuery(instance, lowerQuery)
  );
};
