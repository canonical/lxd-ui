import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdProject } from "types/project";
import { useProject } from "context/project";

export const useProjectEntitlements = (project?: LxdProject) => {
  const { isFineGrained } = useAuth();
  const { project: currentProject } = useProject();

  const validProject = project || currentProject;

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

  return {
    canCreateImages,
    canCreateImageAliases,
  };
};
