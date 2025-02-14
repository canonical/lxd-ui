import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdStoragePool } from "types/storage";

export const useStoragePoolEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeletePool = (pool: LxdStoragePool) =>
    hasEntitlement(isFineGrained, "can_delete", pool?.access_entitlements);

  const canEditPool = (pool: LxdStoragePool) =>
    hasEntitlement(isFineGrained, "can_edit", pool?.access_entitlements);

  return {
    canDeletePool,
    canEditPool,
  };
};
