export interface LxdConfigPair {
  [key: string]: string;
}

export interface LxdConfigOption {
  key: string;
  type: "string" | "integer" | "bool";
  scope: "global" | "local";
  default: string | boolean;
  description: string;
}

export interface LxdDiskDevice {
  path: string;
  pool: string;
  type: "disk";
}

export interface LxdNicDevice {
  name: string;
  network: string;
  type: "nic";
}

export interface LxdDevices {
  [key: string]: LxdDiskDevice | LxdNicDevice;
}
