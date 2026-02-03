import type {
  LxdStorageVolumeContentType,
  LxdStorageVolumeType,
} from "types/storage";

export interface StorageVolumeFormValues {
  name: string;
  project: string;
  pool: string;
  size?: string;
  content_type: LxdStorageVolumeContentType;
  volumeType: LxdStorageVolumeType;
  security_shifted?: string;
  security_unmapped?: string;
  snapshots_expiry?: string;
  snapshots_pattern?: string;
  snapshots_schedule?: string;
  block_filesystem?: string;
  block_mount_options?: string;
  block_type?: string;
  zfs_blocksize?: string;
  zfs_block_mode?: string;
  zfs_delegate?: string;
  zfs_remove_snapshots?: string;
  zfs_use_refquota?: string;
  zfs_reserve_space?: string;
  readOnly: boolean;
  isCreating: boolean;
  entityType: "storageVolume";
  editRestriction?: string;
  clusterMember?: string;
}
