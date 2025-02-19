import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdProject } from "types/project";

export const useProjectEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canCreateInstances = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_instances",
      project?.access_entitlements,
    );

  const canCreateImages = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_images",
      project?.access_entitlements,
    );

  const canCreateImageAliases = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_image_aliases",
      project?.access_entitlements,
    );

  const canCreateStorageVolumes = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_storage_volumes",
      project?.access_entitlements,
    );

  const canCreateNetworks = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_networks",
      project?.access_entitlements,
    );

  const canCreateProfiles = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_profiles",
      project?.access_entitlements,
    );

  return {
    canCreateImageAliases,
    canCreateImages,
    canCreateInstances,
    canCreateNetworks,
    canCreateProfiles,
    canCreateStorageVolumes,
  };
};
