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

  const canEditInstance = () =>
    hasEntitlement(isFineGrained, "can_edit", instance?.access_entitlements);

  return {
    canUpdateInstanceState,
    canEditInstance,
  };
};

export const useInstanceEntitlementSet = (instances: LxdInstance[]) => {
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
