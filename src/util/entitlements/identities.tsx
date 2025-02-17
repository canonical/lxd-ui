import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdIdentity } from "types/permissions";

export const useIdentityEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canEditIdentity = (identity?: LxdIdentity) =>
    hasEntitlement(isFineGrained, "can_edit", identity?.access_entitlements);

  return {
    canEditIdentity,
  };
};
