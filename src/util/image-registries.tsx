import type { LxdImageRegistry } from "types/image";

export const isRegistryPublic = (registry: LxdImageRegistry): boolean => {
  return registry.config?.public?.toLowerCase() === "true";
};
