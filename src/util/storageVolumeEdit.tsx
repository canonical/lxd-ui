import { LxdStorageVolume } from "types/storage";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";

export const getStorageVolumeEditValues = (
  volume: LxdStorageVolume,
): StorageVolumeFormValues => {
  return {
    name: volume.name,
    project: volume.project,
    pool: volume.pool,
    size: volume.config.size ?? "GiB",
    content_type: volume.content_type,
    volumeType: volume.type,
    security_shifted: volume.config["security.shifted"],
    security_unmapped: volume.config["security.unmapped"],
    snapshots_expiry: volume.config["snapshots.expiry"],
    snapshots_pattern: volume.config["snapshots.pattern"],
    snapshots_schedule: volume.config["snapshots.schedule"],
    block_filesystem: volume.config["block.filesystem"],
    block_mount_options: volume.config["block.mount_options"],
    block_type: volume.config["block.type"],
    zfs_blocksize: volume.config["zfs.blocksize"],
    zfs_block_mode: volume.config["zfs.block_mode"],
    zfs_delegate: volume.config["zfs.delegate"],
    zfs_remove_snapshots: volume.config["zfs.remove_snapshots"],
    zfs_use_refquota: volume.config["zfs.use_refquota"],
    zfs_reserve_space: volume.config["zfs.reserve_space"],
    readOnly: true,
    isCreating: false,
    entityType: "storageVolume",
  };
};
