import { AbortControllerState, checkDuplicateName } from "util/helpers";
import { TestFunction } from "yup";
import { AnyObject } from "yup/lib/types";
import { LxdStoragePool } from "types/storage";

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

const storageVolumeFormFieldToPayloadName: Record<string, string> = {
  security_shifted: "security.shifted",
  security_unmapped: "security.unmapped",
  snapshots_expiry: "snapshots.expiry",
  snapshots_pattern: "snapshots.pattern",
  snapshots_schedule: "snapshots.schedule",
  block_filesystem: "block.filesystem",
  block_mount_options: "block.mount_options",
  zfs_blocksize: "zfs.blocksize",
  zfs_block_mode: "zfs.block_mode",
  zfs_delegate: "zfs.delegate",
  zfs_remove_snapshots: "zfs.remove_snapshots",
  zfs_use_refquota: "zfs.use_refquota",
  zfs_reserve_space: "zfs.reserve_space",
};

export const getVolumeKey = (key: string): string => {
  if (Object.keys(storageVolumeFormFieldToPayloadName).includes(key)) {
    return storageVolumeFormFieldToPayloadName[key];
  }
  return key;
};

const storageVolumeDefaults: Record<string, string> = {
  security_shifted: "false",
  security_unmapped: "false",
  snapshots_expiry: "-",
  snapshots_pattern: "snap%d",
  snapshots_schedule: "-",
  block_filesystem: "auto",
  block_mount_options: "-",
  zfs_blocksize: "-",
  zfs_block_mode: "-",
  zfs_delegate: "false",
  zfs_remove_snapshots: "false",
  zfs_use_refquota: "false",
  zfs_reserve_space: "false",
};

export const getLxdDefault = (
  formField: string,
  storagePool?: LxdStoragePool
): [string, string] => {
  const poolField = `volume.${getVolumeKey(formField)}`;
  if (
    storagePool?.config &&
    Object.keys(storagePool.config).includes(poolField)
  ) {
    return [storagePool.config[poolField], `${storagePool.name} pool`];
  }

  if (Object.keys(storageVolumeDefaults).includes(formField)) {
    return [storageVolumeDefaults[formField], "LXD"];
  }
  return ["", "LXD"];
};
