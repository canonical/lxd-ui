export interface LxdDiskDevice {
  name?: string;
  path?: string;
  pool: string;
  size?: string;
  "size.state"?: string;
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

export interface LxdPhysicalGPUDevice {
  name: string;
  type: "gpu";
  gputype: "physical";
  gid?: string;
  id?: string;
  mode?: string;
  pci?: string;
  productid?: string;
  uid?: string;
  vendorid?: string;
}

export interface LxdMdevGPUDevice {
  name: string;
  type: "gpu";
  gputype: "mdev";
  id?: string;
  mdev?: string;
  pci?: string;
  productid?: string;
  vendorid?: string;
}

export interface LxdMigGPUDevice {
  name: string;
  type: "gpu";
  gputype: "mig";
  id?: string;
  "mig.ci"?: string;
  "mig.gi"?: string;
  "mig.uuid"?: string;
  pci?: string;
  productid?: string;
  vendorid?: string;
}

export interface LxdSriovGPUDevice {
  name: string;
  type: "gpu";
  gputype: "sriov";
  id?: string;
  pci?: string;
  productid?: string;
  vendorid?: string;
}

export type LxdGPUDevice =
  | LxdPhysicalGPUDevice
  | LxdMdevGPUDevice
  | LxdMigGPUDevice
  | LxdSriovGPUDevice;

export type LxdOtherDevice =
  | LxdInfinibandDevice
  | LxdPCIDevice
  | LxdTPMDevice
  | LxdUnixBlockDevice
  | LxdUnixCharDevice
  | LxdUnixHotplugDevice
  | LxdUSBDevice;

export interface LxdInfinibandDevice {
  name: string;
  type: "infiniband";
  hwaddr?: string;
  mtu?: string;
  nictype?: string;
  parent?: string;
}

export interface LxdPCIDevice {
  name: string;
  type: "pci";
  address: string;
}

export interface LxdTPMDevice {
  name: string;
  type: "tpm";
  path?: string;
  pathrm?: string;
}

export interface LxdUnixBlockDevice {
  name: string;
  type: "unix-block";
  gid?: string;
  major?: string;
  minor?: string;
  mode?: string;
  path?: string;
  required?: string;
  source?: string;
  uid?: string;
}

export interface LxdUnixCharDevice {
  name: string;
  type: "unix-char";
  gid?: string;
  major?: string;
  minor?: string;
  mode?: string;
  path?: string;
  required?: string;
  source?: string;
  uid?: string;
}

export interface LxdUnixHotplugDevice {
  name: string;
  type: "unix-hotplug";
  gid?: string;
  mode?: string;
  productid?: string;
  required?: string;
  uid?: string;
  vendorid?: string;
}

export interface LxdUSBDevice {
  name: string;
  type: "usb";
  busnum?: string;
  devnum?: string;
  gid?: string;
  mode?: string;
  productid?: string;
  required?: string;
  serial?: string;
  uid?: string;
  vendorid?: string;
}

export interface LxdNoneDevice {
  name?: string;
  type: "none";
}

export type LxdDeviceValue =
  | LxdDiskDevice
  | LxdIsoDevice
  | LxdNicDevice
  | LxdNoneDevice
  | LxdGPUDevice
  | LxdOtherDevice;

export type LxdDevices = Record<string, LxdDeviceValue>;
