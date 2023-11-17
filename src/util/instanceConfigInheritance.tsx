import { SharedFormTypes } from "components/forms/sharedFormTypes";
import { LxdProfile } from "types/profile";
import { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import { isDiskDevice, isNicDevice } from "util/devices";
import { LxdDiskDevice, LxdNicDevice } from "types/device";
import { ProjectFormValues } from "pages/projects/CreateProject";

export const figureInheritedValue = (
  values: SharedFormTypes | ProjectFormValues,
  configKey: string,
  profiles: LxdProfile[],
  configDefault?: string,
): [string, string] => {
  if (Object.prototype.hasOwnProperty.call(values, "profiles")) {
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

  if (configKey === "limits.cpu" && values.type === "instance") {
    if (values.instanceType === "container") {
      return ["-", "LXD (container)"];
    } else {
      return ["1", "LXD (VM)"];
    }
  }

  if (configKey === "limits.memory" && values.type === "instance") {
    if (values.instanceType === "container") {
      return ["-", "LXD (container)"];
    } else {
      return ["1GB", "LXD (VM)"];
    }
  }

  const lxdDefault =
    configDefault && configDefault.length > 0 ? configDefault : "-";

  return [lxdDefault, "LXD"];
};

export const figureInheritedRootStorage = (
  values: SharedFormTypes,
  profiles: LxdProfile[],
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
  profiles: LxdProfile[],
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
  profiles: LxdProfile[],
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
