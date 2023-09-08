import { LxdDiskDevice, LxdNicDevice } from "types/device";

export const isNicDevice = (
  device: LxdDiskDevice | LxdNicDevice
): device is LxdNicDevice => device.type === "nic";

export const isDiskDevice = (
  device: LxdDiskDevice | LxdNicDevice
): device is LxdDiskDevice => device.type === "disk";
