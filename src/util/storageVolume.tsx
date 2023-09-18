import { AbortControllerState, checkDuplicateName } from "util/helpers";
import { TestFunction } from "yup";
import { AnyObject } from "yup/lib/types";

export const testDuplicateName = (
  project: string,
  pool: string,
  controllerState: AbortControllerState
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  return [
    "deduplicate",
    "A storage volume with this name already exists",
    (value?: string) => {
      return checkDuplicateName(
        value,
        project,
        controllerState,
        `storage-pools/${pool}/volumes/custom`
      );
    },
  ];
};

const storageVolumeDefaults: Record<string, string> = {
  security_shifted: "false",
  security_unmapped: "false",
  snapshots_expiry: "-",
  snapshots_pattern: "snap%d",
  snapshots_schedule: "-",
  block_filesystem: "auto",
  block_mount_options: "-",
  lvm_stripes: "-",
  lvm_stripes_size: "-",
  zfs_blocksize: "-",
  zfs_block_mode: "-",
  zfs_delegate: "false",
  zfs_remove_snapshots: "false",
  zfs_use_refquota: "false",
  zfs_reserve_space: "false",
};

export const getLxdDefault = (formField: string): string => {
  if (Object.keys(storageVolumeDefaults).includes(formField)) {
    return storageVolumeDefaults[formField];
  }
  return "";
};
