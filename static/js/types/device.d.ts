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

export interface LxdDevices {
  [key: string]: LxdDiskDevice | LxdNicDevice;
}
