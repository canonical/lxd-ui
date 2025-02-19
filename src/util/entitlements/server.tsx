import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";

export const useServerEntitlements = () => {
  const { isFineGrained, serverEntitlements } = useAuth();

  const canEditServerConfiguration = () =>
    hasEntitlement(isFineGrained, "can_edit", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements);

  const canViewMetrics = () =>
    hasEntitlement(isFineGrained, "can_view_metrics", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements) ||
    hasEntitlement(isFineGrained, "viewer", serverEntitlements);

  const canViewResources = () =>
    hasEntitlement(isFineGrained, "can_view_resources", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements) ||
    hasEntitlement(isFineGrained, "viewer", serverEntitlements);

  return {
    canEditServerConfiguration,
    canViewMetrics,
    canViewResources,
  };
};
