export interface LxdDiskDevice {
  name?: string;
  path?: string;
  pool: string;
  size?: string;
  source?: string;
  "limits.read"?: string;
  "limits.write"?: string;
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

export interface LxdNoneDevice {
  name?: string;
  type: "none";
}

export type LxdDevices = Record<
  string,
  LxdDiskDevice | LxdIsoDevice | LxdNicDevice | LxdNoneDevice
>;
