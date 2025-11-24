import type { LxdInstance } from "types/instance";

export const isInstanceRunning = (instance: LxdInstance) => {
  return ["Ready", "Running"].includes(instance.status);
};

export const isInstanceFrozen = (instance: LxdInstance) => {
  return instance.status === "Frozen";
};
