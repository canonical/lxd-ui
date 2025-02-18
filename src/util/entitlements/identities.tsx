import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdIdentity } from "types/permissions";

export const useIdentityEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteIdentity = (identity?: LxdIdentity) =>
    hasEntitlement(isFineGrained, "can_delete", identity?.access_entitlements);

  const canEditIdentity = (identity?: LxdIdentity) =>
    hasEntitlement(isFineGrained, "can_edit", identity?.access_entitlements);

  return {
    canDeleteIdentity,
    canEditIdentity,
  };
};
