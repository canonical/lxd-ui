import { useAuth } from "context/auth";
import { hasEntitlement, hasEntitlementSet } from "./helpers";
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
