import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";

export const useServerEntitlements = () => {
  const { isFineGrained, serverEntitlements } = useAuth();

  const canViewResources = () =>
    hasEntitlement(isFineGrained, "can_view_resources", serverEntitlements);

  return {
    canViewResources,
  };
};
