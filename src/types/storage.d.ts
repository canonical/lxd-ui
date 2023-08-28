export interface LxdStoragePool {
  config?: {
    size?: string;
    source?: string;
  };
  description: string;
  driver: string;
  locations?: string[];
  name: string;
  source?: string;
  status?: string;
  used_by?: string[];
}

export interface LxdStorageVolume {
  config: {
    "block.filesystem"?: string;
    "block.mount_options"?: string;
    "volatile.rootfs.size"?: number;
    size?: string;
  };
  content_type: string;
  created_at: string;
  description: string;
  location: string;
  name: string;
  project: string;
  type: string;
  used_by?: string[];
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
