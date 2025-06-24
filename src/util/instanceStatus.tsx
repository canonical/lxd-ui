import type { LxdInstance } from "types/instance";

export const isInstanceRunning = (instance: LxdInstance) => {
  return ["Ready", "Running"].includes(instance.status);
};
