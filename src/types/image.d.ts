import { LxdStorageVolume } from "types/storage";

export type LxdImageType = "container" | "virtual-machine" | "iso-volume";

interface LxdImageAlias {
  name: string;
  description: string;
}

export interface LxdImage {
  fingerprint: string;
  public: boolean;
  properties: {
    description: string;
    os: string;
    release: string;
    variant?: string;
  };
  update_source?: {
    alias: string;
    protocol: string;
    server: string;
  };
  architecture: string;
  type: LxdImageType;
  size: number;
  uploaded_at: string;
  aliases: LxdImageAlias[];
  cached: boolean;
}

export interface ImportImage {
  aliases: string;
  server: string;
}

export interface RemoteImage {
  aliases: string;
  arch: string;
  created_at: number;
  lxd_requirements?: {
    secureboot: boolean;
  };
  os: string;
  pool?: string;
  release: string;
  release_title?: string;
  variant?: string;
  versions?: Record<
    string,
    {
      items: Record<
        string,
        {
          ftype: string;
        }
      >;
    }
  >;
  server?: string;
  volume?: LxdStorageVolume;
  type?: LxdImageType;
}

export interface RemoteImageList {
  products: {
    key: RemoteImage;
  };
}
