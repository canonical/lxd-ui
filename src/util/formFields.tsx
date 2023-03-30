import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { SharedFormTypes } from "pages/instances/forms/sharedFormTypes";
import { LxdProfile } from "types/profile";
import { isDiskDevice, isNicDevice } from "util/devices";
import { LxdNicDevice } from "types/device";
import { LxdInstance } from "types/instance";
import { parseDevices } from "util/formDevices";
import { parseCpuLimit, parseMemoryLimit } from "util/limits";
import { OptionHTMLAttributes } from "react";

const formFieldsToPayloadFields: Record<string, string> = {
  rootStorage: "",
  limits_cpu: "limits.cpu",
  limits_memory: "limits.memory",
  limits_memory_swap: "limits.memory.swap",
  limits_disk_priority: "limits.disk.priority",
  limits_processes: "limits.processes",
  security_privileged: "security.privileged",
  security_protection_delete: "security.protection.delete",
  security_protection_shift: "security.protection.shift",
  security_idmap_base: "security.idmap.base",
  security_idmap_size: "security.idmap.size",
  security_idmap_isolated: "security.idmap.isolated",
  security_devlxd: "security.devlxd",
  security_devlxd_images: "security.devlxd.images",
  security_secureboot: "security.secureboot",
  snapshots_pattern: "snapshots.pattern",
  snapshots_expiry: "snapshots.expiry",
  snapshots_schedule: "snapshots.schedule",
  snapshots_schedule_stopped: "snapshots.schedule.stopped",
  cloud_init_network_config: "cloud-init.network-config",
  cloud_init_user_data: "cloud-init.user-data",
  cloud_init_vendor_data: "cloud-init.vendor-data",
};

export const getPayloadKey = (formField: string) => {
  if (!(formField in formFieldsToPayloadFields)) {
    throw new Error(`Could not find ${formField} in formFieldsToPayloadFields`);
  }
  return formFieldsToPayloadFields[formField];
};

export const getSupportedConfigKeys = () => {
  return new Set(Object.values(formFieldsToPayloadFields));
};

export const figureInheritedValue = (
  values: SharedFormTypes,
  formField: string,
  profiles: LxdProfile[]
): [string, string] => {
  if (Object.prototype.hasOwnProperty.call(values, "profiles")) {
    const payloadField = getPayloadKey(formField);
    const appliedProfiles = [
      ...(values as CreateInstanceFormValues | EditInstanceFormValues).profiles,
    ].reverse();
    for (const profileName of appliedProfiles) {
      const profile = profiles.find((profile) => profile.name === profileName);
      if (profile?.config[payloadField]) {
        return [profile.config[payloadField], `${profileName} profile`];
      }
    }
  }

  return ["-", "LXD"];
};

export const figureInheritedRootStorage = (
  values: SharedFormTypes,
  profiles: LxdProfile[]
): [string, string] => {
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
        return [rootDevice.pool, `${profileName} profile`];
      }
    }
  }

  return ["", "LXD"];
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

const collapsedViewMaxWidth = 1420;
export const figureCollapsedScreen = (): boolean =>
  window.innerWidth <= collapsedViewMaxWidth;

export const getEditValues = (item: LxdProfile | LxdInstance) => {
  return {
    name: item.name,
    description: item.description,

    devices: parseDevices(item.devices),

    limits_cpu: parseCpuLimit(item.config["limits.cpu"]),
    limits_memory: parseMemoryLimit(item.config["limits.memory"]),
    limits_memory_swap: item.config["limits.memory.swap"],
    limits_disk_priority: item.config["limits.disk.priority"]
      ? parseInt(item.config["limits.disk.priority"])
      : undefined,
    limits_processes: item.config["limits.processes"]
      ? parseInt(item.config["limits.processes"])
      : undefined,

    security_protection_delete: item.config["security.protection.delete"],
    security_privileged: item.config["security.privileged"],
    security_protection_shift: item.config["security.protection.shift"],
    security_idmap_base: item.config["security.idmap.base"],
    security_idmap_size: item.config["security.idmap.size"]
      ? parseInt(item.config["security.idmap.size"])
      : undefined,
    security_idmap_isolated: item.config["security.idmap.isolated"],
    security_devlxd: item.config["security.devlxd"],
    security_devlxd_images: item.config["security.devlxd.images"],
    security_secureboot: item.config["security.secureboot"],

    snapshots_pattern: item.config["snapshots.pattern"],
    snapshots_expiry: item.config["snapshots.expiry"],
    snapshots_schedule: item.config["snapshots.schedule"],
    snapshots_schedule_stopped: item.config["snapshots.schedule.stopped"],

    cloud_init_network_config: item.config["cloud-init.network-config"],
    cloud_init_user_data: item.config["cloud-init.user-data"],
    cloud_init_vendor_data: item.config["cloud-init.vendor-data"],
  };
};

export const boolRenderer = (
  value?: unknown,
  map?: OptionHTMLAttributes<HTMLOptionElement>[]
): string => {
  const match = map?.find((item) => item.value === value);
  if (match?.label && value !== "") {
    return match.label;
  }

  return "-";
};
