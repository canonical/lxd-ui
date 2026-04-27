import type {
  LxdNicDevice,
  LxdDiskDevice,
  LxdGPUDevice,
  LxdDeviceValue,
  LxdProxyDevice,
  LxdOtherDevice,
} from "types/device";

export interface InheritedDevice {
  key: string;
  device: LxdDeviceValue;
  source: string;
  sourceProfile: string;
}

export interface InheritedDiskDevice {
  key: string;
  disk: LxdDiskDevice;
  source: string;
}

export interface InheritedGPU {
  key: string;
  gpu: LxdGPUDevice;
  source: string;
}

export interface InheritedNetwork {
  key: string;
  network: LxdNicDevice | null;
  source: string;
  sourceProfile: string;
}

export interface InheritedOtherDevice {
  key: string;
  device: LxdOtherDevice;
  source: string;
}

export interface InheritedProxy {
  key: string;
  proxy: LxdProxyDevice;
  source: string;
}
