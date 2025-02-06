import { useAuth } from "context/auth";
import { hasEntitlement, hasEntitlementSet } from "./helpers";
import { LxdProject } from "types/project";
import { useProject } from "context/project";

export const useProjectEntitlements = () => {
  const { isFineGrained } = useAuth();
  const { project: currentProject } = useProject();

  const validProject = project || currentProject;

  const canCreateInstances = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_instances",
      validProject?.access_entitlements,
    );

  const canCreateImages = () =>
    hasEntitlement(
      isFineGrained,
      "can_create_images",
      validProject?.access_entitlements,
    );

  const canCreateImageAliases = () =>
    hasEntitlement(
      isFineGrained,
      "can_create_image_aliases",
      validProject?.access_entitlements,
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

  return {
    canCreateInstances,
    canCreateImages,
    canCreateImageAliases,
  };
};

export const useProjectEntitlementSet = (projects: LxdProject[]) => {
  const { isFineGrained } = useAuth();

  return {
    canCreateInstancesSet: hasEntitlementSet(
      isFineGrained,
      "can_create_instances",
      projects,
    ),
  };
};
