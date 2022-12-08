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

export interface LxdDevice {
  type: string;
}

export interface LxdDiskDevice extends LxdDevice {
  path: string;
  pool: string;
  type: "disk";
}

export interface LxdNicDevice extends LxdDevice {
  name: string;
  network: string;
  type: "nic";
}

export interface LxdDevices {
  [key: string]: LxdDevice;
}
