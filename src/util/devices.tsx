import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "components/forms/instanceAndProfileFormValues";
import type {
  LxdDeviceValue,
  LxdDiskDevice,
  LxdGPUDevice,
  LxdNicDevice,
  LxdNoneDevice,
  LxdOtherDevice,
  LxdProxyDevice,
} from "types/device";
import type { LxdProfile } from "types/profile";
import type { FormDevice, FormDiskDevice } from "util/formDevices";
import { getAppliedProfiles } from "./configInheritance";

export const isNicDevice = (
  device: LxdDeviceValue | FormDevice,
): device is LxdNicDevice => device.type === "nic";

export const isDiskDevice = (
  device: LxdDeviceValue | FormDevice,
): device is LxdDiskDevice => device.type === "disk";

export const isRootDisk = (device: FormDevice): boolean => {
  return device.type === "disk" && device.path === "/" && !device.source;
};

export const isHostDiskDevice = (device: LxdDiskDevice): boolean => {
  return (
    device.type === "disk" && device.pool === undefined && device.path !== "/"
  );
};

export const isNoneDevice = (device: LxdDeviceValue): device is LxdNoneDevice =>
  device.type === "none";

export const isVolumeDevice = (
  device: FormDiskDevice | LxdDiskDevice,
): boolean => {
  // A volume device has a pool and is not a root disk
  // Root disks have path="/" AND no source
  const isRoot = device.path === "/" && !device.source;
  return device.type === "disk" && !!device.pool && !isRoot;
};

export const isGPUDevice = (
  device: LxdDeviceValue | FormDevice,
): device is LxdGPUDevice => device.type === "gpu";

export const isProxyDevice = (
  device: LxdDeviceValue | FormDevice,
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

export const getDeviceAcls = (device?: LxdNicDevice | null) => {
  if (device) {
    return device["security.acls"]?.split(",").filter((t) => t) || [];
  }
  return [];
};

export const getIndex = (
  deviceName: string,
  formik?: InstanceAndProfileFormikProps,
) => {
  if (!formik) return -1;

  return formik?.values.devices.findIndex((t) => t.name === deviceName);
};

export const getProfileFromSource = (source: string) => {
  if (!source || !source.includes(" profile")) {
    return "";
  }

  if (!source.includes(" profile")) {
    return source;
  }

  return source.split(" profile")[0];
};
