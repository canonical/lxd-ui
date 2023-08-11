import { LxdDiskDevice, LxdIsoDevice, LxdNicDevice } from "types/device";

export const isNicDevice = (
  device: LxdDiskDevice | LxdNicDevice | LxdIsoDevice
): device is LxdNicDevice => device.type === "nic";

export const isDiskDevice = (
  device: LxdDiskDevice | LxdNicDevice | LxdIsoDevice
): device is LxdDiskDevice => device.type === "disk";
