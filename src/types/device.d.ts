export interface LxdDiskDevice {
  name?: string;
  path: string;
  pool: string;
  size?: string;
  type: "disk";
}

export interface LxdIsoDevice {
  "boot.priority": string;
  pool: string;
  source: string;
  type: "disk";
}

export interface LxdNicDevice {
  name?: string;
  network: string;
  type: "nic";
}

export type LxdDevices = Record<
  string,
  LxdDiskDevice | LxdIsoDevice | LxdNicDevice
>;
