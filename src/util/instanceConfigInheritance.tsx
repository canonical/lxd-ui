import { SharedFormTypes } from "components/forms/sharedFormTypes";
import { LxdProfile } from "types/profile";
import { getInstanceKey } from "util/instanceConfigFields";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { isDiskDevice, isNicDevice } from "util/devices";
import { LxdDiskDevice, LxdNicDevice } from "types/device";

const lxdDefaults: Record<string, string> = {
  limits_cpu: "-",
  limits_memory: "-",
  limits_memory_swap: "true",
  limits_disk_priority: "5",
  limits_processes: "-",
  security_protection_delete: "false",
  security_privileged: "false",
  security_protection_shift: "false",
  security_idmap_base: "-",
  security_idmap_size: "-",
  security_idmap_isolated: "false",
  security_devlxd: "true",
  security_devlxd_images: "false",
  security_secureboot: "true",
  snapshots_pattern: "snap%d",
  snapshots_expiry: "-",
  snapshots_schedule: "-",
  snapshots_schedule_stopped: "false",
  cloud_init_network_config: "",
  cloud_init_user_data: "",
  cloud_init_vendor_data: "",
  limits_instances: "-",
  limits_containers: "-",
  limits_virtual_machines: "-",
  limits_disk: "-",
  limits_networks: "-",
  restricted_cluster_groups: "-",
  restricted_cluster_target: "block",
  restricted_virtual_machines_low_level: "block",
  restricted_containers_low_level: "block",
  restricted_containers_nesting: "block",
  restricted_containers_privilege: "unprivileged",
  restricted_container_interception: "block",
  restrict_snapshots: "block",
  restricted_idmap_uid: "-",
  restricted_idmap_gid: "-",
  restricted_devices_disk: "managed",
  restricted_devices_disk_paths: "-",
  restricted_devices_gpu: "block",
  restricted_devices_infiniband: "block",
  restricted_devices_nic: "managed",
  restricted_devices_pci: "block",
  restricted_devices_unix_block: "block",
  restricted_devices_unix_char: "block",
  restricted_devices_unix_hotplug: "block",
  restricted_devices_usb: "block",
  restricted_network_access: "-",
  restricted_network_subnets: "block",
  restricted_network_uplinks: "block",
  restricted_network_zones: "block",
};

const getLxdDefault = (configKey: string): string => {
  if (Object.keys(lxdDefaults).includes(configKey)) {
    return lxdDefaults[configKey];
  }
  return "-";
};

const getInstanceDefaults = (
  values: CreateInstanceFormValues | EditInstanceFormValues,
  formField: string
): [string, string] => {
  if (formField === "limits_cpu") {
    if (values.instanceType === "container") {
      return ["-", "LXD (container)"];
    } else {
      return ["1", "LXD (VM)"];
    }
  }

  if (formField === "limits_memory") {
    if (values.instanceType === "container") {
      return ["-", "LXD (container)"];
    } else {
      return ["1GB", "LXD (VM)"];
    }
  }

  return [getLxdDefault(formField), "LXD"];
};

export const figureInheritedValue = (
  values: SharedFormTypes,
  formField: string,
  profiles: LxdProfile[]
): [string, string] => {
  if (Object.prototype.hasOwnProperty.call(values, "profiles")) {
    const configKey = getInstanceKey(formField);
    const appliedProfiles = [
      ...(values as CreateInstanceFormValues | EditInstanceFormValues).profiles,
    ].reverse();
    for (const profileName of appliedProfiles) {
      const profile = profiles.find((profile) => profile.name === profileName);
      if (profile?.config[configKey]) {
        return [profile.config[configKey], `${profileName} profile`];
      }
    }
  }

  if (values.type === "instance") {
    return getInstanceDefaults(values, formField);
  }

  return [getLxdDefault(formField), "LXD"];
};

export const figureInheritedRootStorage = (
  values: SharedFormTypes,
  profiles: LxdProfile[]
): [LxdDiskDevice | null, string] => {
  if (Object.prototype.hasOwnProperty.call(values, "profiles")) {
    const appliedProfiles = [
      ...(values as CreateInstanceFormValues | EditInstanceFormValues).profiles,
    ].reverse();
    for (const profileName of appliedProfiles) {
      const profile = profiles.find((profile) => profile.name === profileName);
      if (!profile) {
        continue;
      }
      const rootDevice = Object.values(profile.devices)
        .filter(isDiskDevice)
        .find((device) => device.path === "/");
      if (rootDevice) {
        return [rootDevice, `${profileName} profile`];
      }
    }
  }

  return [null, "LXD"];
};

export interface InheritedVolume {
  key: string;
  disk: LxdDiskDevice;
  source: string;
}

export const figureInheritedVolumes = (
  values: SharedFormTypes,
  profiles: LxdProfile[]
): InheritedVolume[] => {
  const inheritedVolumes: InheritedVolume[] = [];
  if (Object.prototype.hasOwnProperty.call(values, "profiles")) {
    const appliedProfiles = [
      ...(values as CreateInstanceFormValues | EditInstanceFormValues).profiles,
    ].reverse();
    for (const profileName of appliedProfiles) {
      const profile = profiles.find((profile) => profile.name === profileName);
      if (!profile) {
        continue;
      }
      Object.entries(profile.devices)
        .filter(([key, device]) => isDiskDevice(device) && key !== "root")
        .map(([key, disk]) => {
          inheritedVolumes.push({
            key: key,
            disk: disk as LxdDiskDevice,
            source: `${profileName} profile`,
          });
        });
    }
  }

  return inheritedVolumes;
};

interface InheritedNetwork {
  key: string;
  network: LxdNicDevice | null;
  source: string;
}

export const figureInheritedNetworks = (
  values: SharedFormTypes,
  profiles: LxdProfile[]
): InheritedNetwork[] => {
  const inheritedNetworks: InheritedNetwork[] = [];
  if (Object.prototype.hasOwnProperty.call(values, "profiles")) {
    const appliedProfiles = [
      ...(values as CreateInstanceFormValues | EditInstanceFormValues).profiles,
    ].reverse();
    for (const profileName of appliedProfiles) {
      const profile = profiles.find((profile) => profile.name === profileName);
      if (!profile) {
        continue;
      }
      Object.entries(profile.devices)
        .filter(([_key, network]) => isNicDevice(network))
        .map(([key, network]) => {
          inheritedNetworks.push({
            key: key,
            network: network as LxdNicDevice,
            source: `${profileName} profile`,
          });
        });
    }
  }

  return inheritedNetworks;
};
