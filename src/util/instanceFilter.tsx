import { LxdInstanceStatus } from "types/instance";

export interface InstanceFilters {
  queries: string[];
  statuses: LxdInstanceStatus[];
  types: string[];
  profileQueries: string[];
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
