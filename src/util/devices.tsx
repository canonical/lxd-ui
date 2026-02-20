import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type { InstanceAndProfileFormValues } from "types/forms/instanceAndProfile";
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
import type { FormDevice, FormDiskDevice } from "types/formDevice";
import type { InheritedDiskDevice } from "./configInheritance";
import { getAppliedProfiles } from "./configInheritance";
import type { LxdNetwork } from "types/network";
import { typesWithNicStaticIPSupport } from "./networks";
import type { NetworkDeviceFormValues } from "types/forms/networkDevice";

export const ISO_VOLUME_TYPE = "iso-volume";
export const ISO_VOLUME_NAME = "iso-volume";
export const ISO_VOLUME_PROFILE_NAME = "iso-volume-profile";

export const isValidIPV6 = (ip: string): boolean => {
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|(:)((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}(([0-9]{1,3}\.){3}[0-9]{1,3})|([0-9a-fA-F]{1,4}:){1,4}:(([0-9]{1,3}\.){3}[0-9]{1,3}))$/;

  return ipv6Regex.test(ip);
};

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

export const isIsoDiskDevice = (
  device: LxdDiskDevice | FormDevice | InheritedDiskDevice,
): boolean => {
  if ("disk" in device && "key" in device) {
    return (
      isDiskDevice(device.disk) &&
      (device.key === ISO_VOLUME_NAME || device.key === ISO_VOLUME_PROFILE_NAME)
    );
  }

  return device.type === ISO_VOLUME_TYPE;
};

export const isNoneDevice = (
  device: LxdDeviceValue | FormDevice,
): device is LxdNoneDevice => device.type === "none";

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

export const isCustomNic = (device: LxdDeviceValue): boolean => {
  const standardKeys = [
    "type",
    "name",
    "network",
    "security.acls",
    "ipv4.address",
    "ipv6.address",
    "security.acls.default.egress.action",
    "security.acls.default.ingress.action",
  ];
  return (
    isNicDevice(device) &&
    Object.keys(device).some((key) => !standardKeys.includes(key))
  );
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

export const getNicIpDisableReason = (
  values: NetworkDeviceFormValues,
  network: LxdNetwork,
  family: "IPv4" | "IPv6",
  dhcpDefault?: string,
  dhcpStatefulDefault?: string,
): React.ReactNode => {
  const networkFieldName = family === "IPv4" ? "ipv4.address" : "ipv6.address";
  const isStaticIpv4 = values.ipv4 && values.ipv4 !== "none";
  const networkCIDR = network.config?.[networkFieldName];
  const networkDHCP = getNetworkDHCPOrDefault(network, family, dhcpDefault);
  const networkDHCPStateful = getNetworkDHCPStatefulOrDefault(
    network,
    family,
    dhcpStatefulDefault,
  );

  if (!typesWithNicStaticIPSupport.includes(network.type)) {
    return (
      <>Network must be of type {typesWithNicStaticIPSupport.join(" or ")}.</>
    );
  }

  if (!network.managed) {
    return <>Network is not managed.</>;
  }

  if (network.status !== "Created") {
    return (
      <>
        Network is not in status <code>created</code>.
      </>
    );
  }

  if (networkCIDR === "none" || networkCIDR === undefined) {
    return <>{family} is disabled on the selected network</>;
  }

  if (!networkDHCP || (family === "IPv6" && !networkDHCPStateful)) {
    return (
      <>
        {family === "IPv4"
          ? "IPv4 DHCP is disabled on the selected network."
          : "IPv6 DHCP or IPv6 DHCP stateful are disabled on the selected network."}
      </>
    );
  }

  if (network.type === "ovn" && family === "IPv6" && !isStaticIpv4) {
    return <>IPv4 address reservation must be set to enable this field.</>;
  }

  return null;
};

const getNetworkDHCPOrDefault = (
  network: LxdNetwork,
  family: "IPv4" | "IPv6",
  defaultValue?: string,
): boolean => {
  const result =
    family === "IPv4"
      ? (network.config["ipv4.dhcp"] ?? defaultValue)
      : (network.config["ipv6.dhcp"] ?? defaultValue);
  return result === "true";
};

const getNetworkDHCPStatefulOrDefault = (
  network: LxdNetwork,
  family: "IPv4" | "IPv6",
  defaultValue?: string,
): boolean => {
  const result =
    family === "IPv6"
      ? (network.config["ipv6.dhcp.stateful"] ?? defaultValue)
      : undefined;
  return result === "true";
};
