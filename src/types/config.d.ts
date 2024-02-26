export type LxdConfigPair = Record<string, string>;

export type ConfigField = LxdConfigOption & {
  category: string;
  default: string;
  key: string;
};

export interface LxdConfigOption {
  default?: string;
  defaultdesc?: string;
  longdesc?: string;
  scope?: "global" | "local";
  shortdesc?: string;
  type: "bool" | "string" | "integer";
}

export interface LxcConfigOptionCategories {
  [category: string]: {
    keys: {
      [key: string]: LxdConfigOption;
    }[];
  };
}

export interface LxdConfigOptions {
  configs: {
    cluster: LxcConfigOptionCategories;
    instance: LxcConfigOptionCategories;
    project: LxcConfigOptionCategories;
    server: LxcConfigOptionCategories;
    "storage-btrfs": LxcConfigOptionCategories;
    "storage-ceph": LxcConfigOptionCategories;
    "storage-cephfs": LxcConfigOptionCategories;
    "storage-cephobject": LxcConfigOptionCategories;
    "storage-dir": LxcConfigOptionCategories;
    "storage-lvm": LxcConfigOptionCategories;
    "storage-powerflex": LxcConfigOptionCategories;
    "storage-zfs": LxcConfigOptionCategories;
  };
}

export type LxdConfigOptionsKeys = keyof LxdConfigOptions["configs"];
