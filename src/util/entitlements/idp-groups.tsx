import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import type { IdpGroup } from "types/permissions";

export const useIdpGroupEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteIdpGroup = (group?: IdpGroup) =>
    hasEntitlement(isFineGrained, "can_delete", group?.access_entitlements);

  const canEditIdpGroup = (group?: IdpGroup) =>
    hasEntitlement(isFineGrained, "can_edit", group?.access_entitlements);

  return {
    canDeleteIdpGroup,
    canEditIdpGroup,
  };
};
