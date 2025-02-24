import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdGroup } from "types/permissions";

export const useGroupEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteGroup = (group?: LxdGroup) =>
    hasEntitlement(isFineGrained, "can_delete", group?.access_entitlements);

  const canEditGroup = (group?: LxdGroup) =>
    hasEntitlement(isFineGrained, "can_edit", group?.access_entitlements);

  return {
    canDeleteGroup,
    canEditGroup,
  };
};
