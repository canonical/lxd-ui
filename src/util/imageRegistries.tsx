import type { LxdImageRegistry } from "types/image";

export const isImageRegistryPublic = (registry: LxdImageRegistry): boolean => {
  return registry.config?.public?.toLowerCase() === "true";
};
