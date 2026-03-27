import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import type { LxdClusterLink } from "types/cluster";

export const useClusterLinkEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteClusterLink = (clusterLink?: LxdClusterLink) =>
    hasEntitlement(
      isFineGrained,
      "can_delete",
      clusterLink?.access_entitlements,
    );

  const canEditClusterLink = (clusterLink?: LxdClusterLink) =>
    hasEntitlement(isFineGrained, "can_edit", clusterLink?.access_entitlements);

  return {
    canDeleteClusterLink,
    canEditClusterLink,
  };
};
