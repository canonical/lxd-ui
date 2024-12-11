import { InstanceAndProfileFormValues } from "components/forms/instanceAndProfileFormValues";
import {
  LxdDeviceValue,
  LxdDiskDevice,
  LxdGPUDevice,
  LxdNicDevice,
  LxdOtherDevice,
  LxdProxyDevice,
} from "types/device";
import { LxdProfile } from "types/profile";
import { FormDevice, FormDiskDevice } from "util/formDevices";
import { getAppliedProfiles } from "./configInheritance";

export const isNicDevice = (device: LxdDeviceValue): device is LxdNicDevice =>
  device.type === "nic";

export const isDiskDevice = (device: LxdDeviceValue): device is LxdDiskDevice =>
  device.type === "disk";

export const isHostDiskDevice = (device: LxdDiskDevice): boolean => {
  return (
    device.type === "disk" && device.pool === undefined && device.path !== "/"
  );
};

export const isVolumeDevice = (
  device: FormDiskDevice | LxdDiskDevice,
): boolean => {
  return device.type === "disk" && !!device.pool && device.path !== "/";
};

export const isGPUDevice = (device: LxdDeviceValue): device is LxdGPUDevice =>
  device.type === "gpu";

export const isProxyDevice = (
  device: LxdDeviceValue,
): device is LxdProxyDevice => device.type === "proxy";

export const isOtherDevice = (
  device: LxdDeviceValue | FormDevice,
): device is LxdOtherDevice => {
  const otherDeviceTypes = [
    "pci",
    "usb",
    "infiniband",
    "tpm",
    "unix-block",
    "unix-char",
    "unix-hotplug",
  ];
  return otherDeviceTypes.includes(device.type ?? "");
};

export const deviceKeyToLabel = (input: string): string => {
  const map = {
    busnum: "Bus number",
    devnum: "Device number",
    gid: "GID",
    hwaddr: "HW address",
    id: "ID",
    major: "Major",
    minor: "Minor",
    mode: "Mode",
    mtu: "MTU",
    name: "Name",
    nictype: "NIC type",
    parent: "Parent",
    path: "Path",
    pathrm: "Resource manager path",
    pci: "PCI address",
    productid: "Product ID",
    required: "Required",
    serial: "Serial",
    source: "Source",
    uid: "UID",
    vendorid: "Vendor ID",
    gputype: "GPU type",
    type: "Type",
    nat: "NAT mode",
    bind: "Bind",
    proxy_protocol: "Use HAproxy protocol",
    listen: "Listen",
    connect: "Connect",
    security_gid: "Security GID",
    security_id: "Security ID",
  };
  if (input in map) {
    return map[input as keyof typeof map];
  }
  return input;
};

export const getExistingDeviceNames = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): string[] => {
  const existingDeviceNames: string[] = [];

  // Returns devices within the instance
  existingDeviceNames.push(...values.devices.map((item) => item.name));
  // Returns devices from any of the profiles assigned to the instance
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      Object.entries(profile.devices).map(([key]) => {
        existingDeviceNames.push(key);
      });
    }
  }

  return existingDeviceNames;
};
