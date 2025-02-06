import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdProject } from "types/project";

export const useProjectEntitlements = (project?: LxdProject) => {
  const { isFineGrained } = useAuth();

  const canCreateInstances = () =>
    hasEntitlement(
      isFineGrained,
      "can_create_instances",
      project?.access_entitlements,
    );

  return {
    canCreateInstances,
  };
};
