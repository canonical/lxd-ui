import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import type { LxdNetworkAcl } from "types/network";

export const useNetworkAclEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canEditNetworkAcl = (acl?: LxdNetworkAcl) =>
    hasEntitlement(isFineGrained, "can_edit", acl?.access_entitlements);

  const canDeleteNetworkAcl = (acl?: LxdNetworkAcl) =>
    hasEntitlement(isFineGrained, "can_delete", acl?.access_entitlements);

  return {
    canDeleteNetworkAcl,
    canEditNetworkAcl,
  };
};
