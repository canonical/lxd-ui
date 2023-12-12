import {
  AbortControllerState,
  capitalizeFirstLetter,
  checkDuplicateName,
} from "./helpers";
import { AnyObject, TestContext, TestFunction } from "yup";
import { LxdStorageVolume } from "types/storage";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { ConfigRowMetadata } from "util/configInheritance";

export const testDuplicateStorageVolumeName = (
  project: string,
  volumeType: string,
  controllerState: AbortControllerState,
  previousName?: string,
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  return [
    "deduplicate",
    "A storage volume with this name already exists",
    (value?: string, context?: TestContext) => {
      const pool = (context?.parent as StorageVolumeFormValues).pool;
      return (
        value === previousName ||
        checkDuplicateName(
          value,
          project,
          controllerState,
          `storage-pools/${pool}/volumes/${volumeType}`,
        )
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

export const getStorageVolumeDefault = (
  formField: string,
): ConfigRowMetadata => {
  if (Object.keys(storageVolumeDefaults).includes(formField)) {
    return { value: storageVolumeDefaults[formField], source: "LXD" };
  }
  return { value: "", source: "LXD" };
};

export const renderVolumeType = (volume: LxdStorageVolume) => {
  return volume.type === "virtual-machine"
    ? "VM"
    : capitalizeFirstLetter(volume.type);
};

export const renderContentType = (volume: LxdStorageVolume) => {
  return volume.content_type === "iso"
    ? "ISO"
    : capitalizeFirstLetter(volume.content_type);
};

export const isSnapshot = (volume: LxdStorageVolume) => {
  return volume.name.includes("/");
};

export const splitVolumeSnapshotName = (fullVolumeName: string) => {
  const fullVolumeNameSplit = fullVolumeName.split("/");
  const snapshotName = fullVolumeNameSplit.pop() || "";
  const volumeName = fullVolumeNameSplit.join("");
  return {
    snapshotName,
    volumeName,
  };
};

export const getSnapshotsPerVolume = (volumes: LxdStorageVolume[]) => {
  const snapshotPerVolumeLookup: { [volumeName: string]: string[] } = {};
  for (const volume of volumes) {
    if (isSnapshot(volume)) {
      const { volumeName, snapshotName } = splitVolumeSnapshotName(volume.name);
      if (!snapshotPerVolumeLookup[volumeName]) {
        snapshotPerVolumeLookup[volumeName] = [];
      }

      snapshotPerVolumeLookup[volumeName].push(snapshotName);
    }
  }

  return snapshotPerVolumeLookup;
};

const collapsedViewMaxWidth = 1250;
export const figureCollapsedScreen = (): boolean =>
  window.innerWidth <= collapsedViewMaxWidth;
