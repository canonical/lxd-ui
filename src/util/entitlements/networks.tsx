import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdNetwork } from "types/network";

export const useNetworkEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canEditNetwork = (network?: LxdNetwork) =>
    hasEntitlement(isFineGrained, "can_edit", network?.access_entitlements);

  const canDeleteNetwork = (network?: LxdNetwork) =>
    hasEntitlement(isFineGrained, "can_delete", network?.access_entitlements);

  return {
    canDeleteNetwork,
    canEditNetwork,
  };
};
