import { useAuth } from "context/auth";
import { LxdInstance } from "types/instance";
import { hasEntitlement } from "./helpers";

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
