import {
  LxdDiskDevice,
  LxdIsoDevice,
  LxdNicDevice,
  LxdNoneDevice,
} from "types/device";

export const isNicDevice = (
  device: LxdDiskDevice | LxdNicDevice | LxdIsoDevice | LxdNoneDevice,
): device is LxdNicDevice => device.type === "nic";

export const isDiskDevice = (
  device: LxdDiskDevice | LxdNicDevice | LxdIsoDevice | LxdNoneDevice,
): device is LxdDiskDevice => device.type === "disk";
