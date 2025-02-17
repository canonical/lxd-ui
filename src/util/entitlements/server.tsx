import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";

export const useServerEntitlements = () => {
  const { isFineGrained, serverEntitlements } = useAuth();

  const canCreateGroups = () =>
    hasEntitlement(isFineGrained, "can_create_groups", serverEntitlements) ||
    hasEntitlement(isFineGrained, "permission_manager", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements);

  const canCreateIdentities = () =>
    hasEntitlement(
      isFineGrained,
      "can_create_identities",
      serverEntitlements,
    ) ||
    hasEntitlement(isFineGrained, "permission_manager", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements);

  const canCreateIdpGroups = () =>
    hasEntitlement(
      isFineGrained,
      "can_create_identity_provider_groups",
      serverEntitlements,
    ) ||
    hasEntitlement(isFineGrained, "permission_manager", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements);

  const canCreateProjects = () =>
    hasEntitlement(isFineGrained, "can_create_projects", serverEntitlements) ||
    hasEntitlement(isFineGrained, "project_manager", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements);

  const canCreateStoragePools = () =>
    hasEntitlement(
      isFineGrained,
      "can_create_storage_pools",
      serverEntitlements,
    ) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements) ||
    hasEntitlement(isFineGrained, "storage_pool_manager", serverEntitlements);

  const canEditServerConfiguration = () =>
    hasEntitlement(isFineGrained, "can_edit", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements);

  const canViewMetrics = () =>
    hasEntitlement(isFineGrained, "can_view_metrics", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements) ||
    hasEntitlement(isFineGrained, "viewer", serverEntitlements);

  const canViewPermissions = () =>
    hasEntitlement(isFineGrained, "can_view_permissions", serverEntitlements) ||
    hasEntitlement(isFineGrained, "permission_manager", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements);

  const canViewResources = () =>
    hasEntitlement(isFineGrained, "can_view_resources", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements) ||
    hasEntitlement(isFineGrained, "viewer", serverEntitlements);

  return {
    canCreateGroups,
    canCreateIdentities,
    canCreateIdpGroups,
    canCreateProjects,
    canCreateStoragePools,
    canEditServerConfiguration,
    canViewMetrics,
    canViewPermissions,
    canViewResources,
  };
};
