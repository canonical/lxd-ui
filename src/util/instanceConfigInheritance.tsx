import { SharedFormTypes } from "pages/instances/forms/sharedFormTypes";
import { LxdProfile } from "types/profile";
import { getInstanceKey } from "util/instanceConfigFields";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { isDiskDevice, isNicDevice } from "util/devices";
import { LxdNicDevice } from "types/device";

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
