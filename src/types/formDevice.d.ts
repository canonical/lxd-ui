import type {
  LxdDiskDevice,
  LxdIsoDevice,
  LxdNicDevice,
  LxdOtherDevice,
  LxdGPUDevice,
  LxdProxyDevice,
} from "types/device";

interface EmptyDevice {
  type: "";
  name: string;
}

interface UnknownDevice {
  type: "unknown";
  name: string;
  bare: unknown;
}

interface NoneDevice {
  type: "none";
  name: string;
}

export interface IsoVolumeDevice {
  type: "iso-volume";
  name: string;
  bare: LxdIsoDevice;
}

export interface CustomNetworkDevice {
  type: "custom-nic";
  name: string;
  bare: LxdNicDevice;
}

export type FormDiskDevice = Partial<LxdDiskDevice> &
  Required<Pick<LxdDiskDevice, "name">> & {
    limits?: {
      read?: string;
      write?: string;
    };
    bare?: LxdDiskDevice;
  };

export type FormNetworkDevice = Partial<LxdNicDevice> &
  Required<Pick<LxdNicDevice, "name">>;

export type FormDevice =
  | FormDiskDevice
  | FormNetworkDevice
  | UnknownDevice
  | NoneDevice
  | CustomNetworkDevice
  | IsoVolumeDevice
  | LxdGPUDevice
  | LxdProxyDevice
  | LxdOtherDevice
  | EmptyDevice;
