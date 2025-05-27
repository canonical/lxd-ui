import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import type { LxdStorageVolume } from "types/storage";

export const useStorageVolumeEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeleteVolume = (volume?: LxdStorageVolume) =>
    hasEntitlement(isFineGrained, "can_delete", volume?.access_entitlements);

  const canEditVolume = (volume?: LxdStorageVolume) =>
    hasEntitlement(isFineGrained, "can_edit", volume?.access_entitlements);

  const canManageStorageVolumeSnapshots = (volume?: LxdStorageVolume) =>
    hasEntitlement(
      isFineGrained,
      "can_manage_snapshots",
      volume?.access_entitlements,
    );

  const canManageVolumeBackups = (volume?: LxdStorageVolume) =>
    hasEntitlement(
      isFineGrained,
      "can_manage_backups",
      volume?.access_entitlements,
    );

  return {
    canDeleteVolume,
    canEditVolume,
    canManageStorageVolumeSnapshots,
    canManageVolumeBackups,
  };
};
