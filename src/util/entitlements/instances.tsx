import { useAuth } from "context/auth";
import { LxdInstance } from "types/instance";
import { hasEntitlement, hasEntitlementSet } from "./helpers";

export const useInstanceEntitlements = (instance: LxdInstance) => {
  const { isFineGrained } = useAuth();

  const canUpdateInstanceState = () =>
    hasEntitlement(
      isFineGrained,
      "can_update_state",
      instance?.access_entitlements,
    );

  return {
    canUpdateInstanceState,
  };
};

export const useBulkInstanceEntitlements = (instances: LxdInstance[]) => {
  const { isFineGrained } = useAuth();

  return {
    canUpdateInstanceStateSet: hasEntitlementSet(
      isFineGrained,
      "can_update_state",
      instances,
    ),
    canDeleteInstanceStateSet: hasEntitlementSet(
      isFineGrained,
      "can_delete",
      instances,
    ),
  };
};
