import { useAuth } from "context/auth";
import type { LxdInstance } from "types/instance";
import { hasEntitlement } from "./helpers";

export const useInstanceEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canAccessInstanceConsole = (instance?: LxdInstance) =>
    hasEntitlement(
      isFineGrained,
      "can_access_console",
      instance?.access_entitlements,
    );

  const canDeleteInstance = (instance?: LxdInstance) =>
    hasEntitlement(isFineGrained, "can_delete", instance?.access_entitlements);

  const canEditInstance = (instance?: LxdInstance) =>
    hasEntitlement(isFineGrained, "can_edit", instance?.access_entitlements);

  const canExecInstance = (instance?: LxdInstance) =>
    hasEntitlement(isFineGrained, "can_exec", instance?.access_entitlements);

  const canManageInstanceBackups = (instance?: LxdInstance) =>
    hasEntitlement(
      isFineGrained,
      "can_manage_backups",
      instance?.access_entitlements,
    );

  const canManageInstanceSnapshots = (instance?: LxdInstance) =>
    hasEntitlement(
      isFineGrained,
      "can_manage_snapshots",
      instance?.access_entitlements,
    );

  const canUpdateInstanceState = (instance?: LxdInstance) =>
    hasEntitlement(
      isFineGrained,
      "can_update_state",
      instance?.access_entitlements,
    );

  return {
    canAccessInstanceConsole,
    canDeleteInstance,
    canEditInstance,
    canExecInstance,
    canManageInstanceBackups,
    canManageInstanceSnapshots,
    canUpdateInstanceState,
  };
};
