export interface LxdDiskDevice {
  path: string;
  pool: string;
  type: "disk";
}

export interface LxdNicDevice {
  name?: string;
  network: string;
  type: "nic";
}

export type LxdDevices = Record<string, LxdDiskDevice | LxdNicDevice>;
