export interface LxdStoragePool {
  config?: {
    size?: string;
    source?: string;
  } & Record<string, string | undefined>;
  description: string;
  driver: string;
  locations?: string[];
  name: string;
  source?: string;
  status?: string;
  used_by?: string[];
}

export type LxdStorageVolumeContentType = "filesystem" | "block" | "iso";

export interface LxdStorageVolume {
  config: {
    "block.filesystem"?: string;
    "block.mount_options"?: string;
    "volatile.rootfs.size"?: number;
    "security.shifted"?: string;
    "security.unmapped"?: string;
    "snapshots.expiry"?: string;
    "snapshots.pattern"?: string;
    "snapshots.schedule"?: string;
    "zfs.blocksize"?: string;
    "zfs.block_mode"?: string;
    "zfs.delegate"?: string;
    "zfs.remove_snapshots"?: string;
    "zfs.use_refquota"?: string;
    "zfs.reserve_space"?: string;
    size?: string;
  };
  content_type: LxdStorageVolumeContentType;
  created_at: string;
  description: string;
  location: string;
  name: string;
  pool: string;
  project: string;
  type: string;
  used_by?: string[];
  etag?: string;
}

export interface LxdStorageVolumeState {
  usage: {
    used: number;
    total: number;
  };
}

export interface LxdStoragePoolResources {
  inodes: {
    used: number;
    total: number;
  };
  space: {
    used: number;
    total: number;
  };
}

export interface UploadState {
  percentage: number;
  loaded: number;
  total?: number;
}
