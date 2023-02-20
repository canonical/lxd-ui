export interface LxdStorage {
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

export interface LxdStorageResources {
  inodes: {
    used: number;
    total: number;
  };
  space: {
    used: number;
    total: number;
  };
}
