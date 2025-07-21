import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import type { LxdAuthGroup } from "types/permissions";

export const useGroupEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteGroup = (group?: LxdAuthGroup) =>
    hasEntitlement(isFineGrained, "can_delete", group?.access_entitlements);

  const canEditGroup = (group?: LxdAuthGroup) =>
    hasEntitlement(isFineGrained, "can_edit", group?.access_entitlements);

  return {
    canDeleteGroup,
    canEditGroup,
  };
};
