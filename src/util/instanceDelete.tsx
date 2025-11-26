import type { LxdInstanceStatus } from "types/instance";

export const deletableStatuses: LxdInstanceStatus[] = [
  "Error",
  "Stopped",
  "Running",
  "Frozen",
];

export const bulkDeletableStatuses: LxdInstanceStatus[] = ["Error", "Stopped"];
