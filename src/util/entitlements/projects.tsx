import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import type { LxdProject } from "types/project";

export const useProjectEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canCreateImageAliases = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_image_aliases",
      project?.access_entitlements,
    );

  const canCreateImages = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_images",
      project?.access_entitlements,
    );

  const canCreateInstances = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_instances",
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

  const canCreateStorageVolumes = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_storage_volumes",
      project?.access_entitlements,
    );

  const canDeleteProject = (project?: LxdProject) =>
    hasEntitlement(isFineGrained, "can_delete", project?.access_entitlements);

  const canEditProject = (project?: LxdProject) =>
    hasEntitlement(isFineGrained, "can_edit", project?.access_entitlements);

  const canViewEvents = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_view_events",
      project?.access_entitlements,
    );

  const canViewOperations = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_view_operations",
      project?.access_entitlements,
    );

  return {
    canCreateImageAliases,
    canCreateImages,
    canCreateInstances,
    canCreateNetworks,
    canCreateProfiles,
    canCreateStorageVolumes,
    canDeleteProject,
    canEditProject,
    canViewEvents,
    canViewOperations,
  };
};
