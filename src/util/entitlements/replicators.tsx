import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import type { LxdReplicator } from "types/replicator";

export const useReplicatorEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteReplicator = (replicator?: LxdReplicator) =>
    hasEntitlement(
      isFineGrained,
      "can_delete",
      replicator?.access_entitlements,
    );

  const canEditReplicator = (replicator: LxdReplicator) =>
    hasEntitlement(isFineGrained, "can_edit", replicator?.access_entitlements);

  return {
    canDeleteReplicator,
    canEditReplicator,
  };
};
