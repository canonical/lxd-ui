import { useAuth } from "context/auth";
import { LxdInstance } from "types/instance";
import { hasEntitlement } from "./helpers";

export const useInstanceEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canUpdateInstanceState = (instance: LxdInstance) =>
    !isFineGrained ||
    hasEntitlement(instance?.access_entitlements || [], "can_update_state");

  return {
    canUpdateInstanceState,
  };
};
