import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { IdpGroup } from "types/permissions";

export const useIdpGroupEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canEditGroup = (group?: IdpGroup) =>
    hasEntitlement(isFineGrained, "can_edit", group?.access_entitlements);

  const canDeleteGroup = (group?: IdpGroup) =>
    hasEntitlement(isFineGrained, "can_delete", group?.access_entitlements);

  return {
    canDeleteGroup,
    canEditGroup,
  };
};
