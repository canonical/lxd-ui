interface LxdImageAlias {
  name: string;
  description: string;
}

export interface LxdImage {
  fingerprint: string;
  public: boolean;
  properties: {
    description: string;
  };
  architecture: string;
  type: string;
  size: number;
  uploaded_at: string;
  aliases: LxdImageAlias[];
}

export interface ImportImage {
  aliases: string;
  server: string;
}

export interface RemoteImage {
  aliases: string;
  arch: string;
  lxd_requirements: {
    secureboot: boolean;
  };
  os: string;
  release: string;
  release_title: string;
  variant: string;
  versions: {};
  server: string;
}

export interface RemoteImageList {
  products: {
    key: RemoteImage;
  };
}
