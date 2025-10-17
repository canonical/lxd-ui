import type { InstanceAndProfileFormValues } from "components/forms/instanceAndProfileFormValues";
import type { LxdProfile } from "types/profile";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import {
  isDiskDevice,
  isGPUDevice,
  isHostDiskDevice,
  isNicDevice,
  isOtherDevice,
  isProxyDevice,
  isVolumeDevice,
} from "util/devices";
import type {
  LxdDeviceValue,
  LxdDiskDevice,
  LxdGPUDevice,
  LxdNicDevice,
  LxdOtherDevice,
  LxdProxyDevice,
} from "types/device";
import type { ProjectFormValues } from "pages/projects/CreateProject";
import type { ConfigurationRowFormikValues } from "components/ConfigurationRow";
import type { ConfigField } from "types/config";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchConfigOptions } from "api/server";
import { toConfigFields } from "util/config";
import { getInstanceField } from "util/instanceConfigFields";
import { useParams } from "react-router-dom";
import { getProjectKey } from "util/projectConfigFields";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { getVolumeKey } from "util/storageVolume";
import { getNetworkKey, networkFormTypeToOptionKey } from "util/networks";
import { getPoolKey, storagePoolFormDriverToOptionKey } from "./storagePool";
import type { StoragePoolFormValues } from "pages/storage/forms/StoragePoolForm";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { useSettings } from "context/useSettings";
import { useProfiles } from "context/useProfiles";
import { useStoragePool } from "context/useStoragePools";

export interface ConfigRowMetadata {
  value?: string;
  source: string;
  configField?: ConfigField;
}

export const getConfigRowMetadata = (
  values: ConfigurationRowFormikValues,
  name: string,
): ConfigRowMetadata => {
  switch (values.entityType) {
    case "instance":
    case "profile":
      return getInstanceRowMetadata(values, name);
    case "project":
      return getProjectRowMetadata(values, name);
    case "storageVolume":
      return getStorageVolumeRowMetadata(values, name);
    case "network":
      return getNetworkRowMetadata(values, name);
    case "storagePool":
      return getStoragePoolRowMetadata(values, name);
    case "network-acl":
      throw new Error("Network ACLs do not have row metadata");
  }
};

const getConfigOptions = () => {
  const { hasMetadataConfiguration } = useSupportedFeatures();
  const { data: configOptions } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: async () => fetchConfigOptions(hasMetadataConfiguration),
  });

  return configOptions;
};

const getInstanceRowMetadata = (
  values: InstanceAndProfileFormValues | ProjectFormValues,
  name: string,
): ConfigRowMetadata => {
  const configOptions = getConfigOptions();

  const configFields = toConfigFields(configOptions?.configs.instance ?? {});
  const configKey = getInstanceField(name);
  const configField = configFields.find((item) => item.key === configKey);

  const { project } = useParams<{ project: string }>();
  const { data: profiles = [] } = useProfiles(project as string);

  // inherited values from applied profiles
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      if (profile?.config[configKey]) {
        return {
          value: profile.config[configKey],
          source: `${profile.name} profile`,
          configField,
        };
      }
    }
  }

  return getInstanceProfileProjectDefaults(values, configKey, configField);
};

const getLxdDefault = (configField: ConfigField | undefined): string => {
  return configField?.default && configField?.default.length > 0
    ? configField?.default
    : "-";
};

const getProjectRowMetadata = (
  values: ProjectFormValues,
  name: string,
): ConfigRowMetadata => {
  const configOptions = getConfigOptions();

  const configFields = toConfigFields(configOptions?.configs.project ?? {});
  const configKey = getProjectKey(name);
  const configField = configFields.find((item) => item.key === configKey);

  return getInstanceProfileProjectDefaults(values, configKey, configField);
};

const getStorageVolumeRowMetadata = (
  values: StorageVolumeFormValues,
  name: string,
): ConfigRowMetadata => {
  const storagePoolQueryEnabled = values.isCreating;
  // when creating the defaults will be taken from the storage pool, if set there
  const { data: pool } = useStoragePool(
    values.pool,
    undefined,
    storagePoolQueryEnabled,
  );
  const poolField = `volume.${getVolumeKey(name)}`;
  if (pool?.config && poolField in pool.config) {
    return { value: pool.config[poolField], source: `${pool.name} pool` };
  }

  const configOptions = getConfigOptions();

  const optionKey = storagePoolFormDriverToOptionKey(pool?.driver ?? "zfs");
  const configFields = toConfigFields(configOptions?.configs[optionKey] ?? {});
  const configKey = getVolumeKey(name);
  const configField = configFields.find((item) => item.key === configKey);

  const lxdDefault = getLxdDefault(configField);

  return { value: lxdDefault, source: "LXD", configField };
};

const getNetworkRowMetadata = (
  values: NetworkFormValues,
  name: string,
): ConfigRowMetadata => {
  const configOptions = getConfigOptions();

  const optionKey = networkFormTypeToOptionKey(values.networkType);
  const configFields = toConfigFields(configOptions?.configs[optionKey] ?? {});
  const configKey = getNetworkKey(name);
  const configField = configFields.find((item) => item.key === configKey);

  const lxdDefault = getLxdDefault(configField);

  return { value: lxdDefault, source: "LXD", configField };
};

// NOTE: this is only relevant for Ceph RBD storage pools at the moment
const getStoragePoolRowMetadata = (
  values: StoragePoolFormValues,
  name: string,
): ConfigRowMetadata => {
  const configOptions = getConfigOptions();

  const optionKey = storagePoolFormDriverToOptionKey(values.driver);
  const configFields = toConfigFields(configOptions?.configs[optionKey] ?? {});
  const configKey = getPoolKey(name);
  const configField = configFields.find((item) => item.key === configKey);

  const lxdDefault = getLxdDefault(configField);

  return { value: lxdDefault, source: "LXD", configField };
};

const getInstanceProfileProjectDefaults = (
  values: InstanceAndProfileFormValues | ProjectFormValues,
  configKey: string,
  configField?: ConfigField,
): ConfigRowMetadata => {
  if (configKey === "limits.cpu" && values.entityType === "instance") {
    if (values.instanceType === "container") {
      return { value: "-", source: "LXD (container)", configField };
    } else {
      return { value: "1", source: "LXD (VM)", configField };
    }
  }

  if (configKey === "limits.memory" && values.entityType === "instance") {
    if (values.instanceType === "container") {
      return { value: "-", source: "LXD (container)", configField };
    } else {
      return { value: "1GB", source: "LXD (VM)", configField };
    }
  }

  // migration.stateful is inherited through 4 levels:
  // 1. LXD default
  // 2. server setting "instances.migration.stateful"
  // 3. by a profile
  // 4. by the instance itself
  // here we handle level 2. level 1 is handled below. Levels 3 and 4 are handled by the caller.
  if (configKey === "migration.stateful") {
    const { data: settings } = useSettings();
    const serverSetting = settings?.config?.["instances.migration.stateful"];

    if (serverSetting) {
      return { value: serverSetting, source: "Server settings", configField };
    }
  }

  const lxdDefault = getLxdDefault(configField);

  return { value: lxdDefault, source: "LXD", configField };
};

interface InheritedDevice {
  key: string;
  device: LxdDeviceValue;
  source: string;
}

const getInheritedDevices = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedDevice[] => {
  const result: InheritedDevice[] = [];
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      Object.entries(profile.devices).map(([key, device]) => {
        const id = result.findIndex((item) => item.key === key);
        // device already exists, skip it
        if (id !== -1) {
          return;
        }
        result.push({ key, device, source: `${profile.name} profile` });
      });
    }
  }
  return result;
};

export const getInheritedRootStorage = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): [LxdDiskDevice | null, string] => {
  const rootDisk = getInheritedDevices(values, profiles)
    .filter((item) => isDiskDevice(item.device))
    .find((item) => (item.device as LxdDiskDevice).path === "/");

  if (rootDisk) {
    return [
      { ...rootDisk.device, name: rootDisk.key } as LxdDiskDevice,
      rootDisk.source,
    ];
  }

  return [null, "LXD"];
};

export interface InheritedDiskDevice {
  key: string;
  disk: LxdDiskDevice;
  source: string;
}

export const getInheritedDiskDevices = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedDiskDevice[] => {
  return getInheritedDevices(values, profiles)
    .filter((item) => {
      return (
        isVolumeDevice(item.device as LxdDiskDevice) ||
        isHostDiskDevice(item.device as LxdDiskDevice)
      );
    })
    .map((item) => ({
      ...item,
      disk: item.device as LxdDiskDevice,
    }));
};

interface InheritedNetwork {
  key: string;
  network: LxdNicDevice | null;
  source: string;
}

export const getInheritedNetworks = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedNetwork[] => {
  return getInheritedDevices(values, profiles)
    .filter((item) => isNicDevice(item.device))
    .map((item) => ({
      ...item,
      network: item.device as LxdNicDevice,
    }));
};

interface InheritedGPU {
  key: string;
  gpu: LxdGPUDevice;
  source: string;
}

export const getInheritedGPUs = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedGPU[] => {
  return getInheritedDevices(values, profiles)
    .filter((item) => isGPUDevice(item.device))
    .map((item) => ({
      ...item,
      gpu: item.device as LxdGPUDevice,
    }));
};

interface InheritedProxy {
  key: string;
  proxy: LxdProxyDevice;
  source: string;
}

export const getInheritedProxies = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedProxy[] => {
  return getInheritedDevices(values, profiles)
    .filter((item) => isProxyDevice(item.device))
    .map((item) => ({
      ...item,
      proxy: item.device as LxdProxyDevice,
    }));
};

interface InheritedOtherDevice {
  key: string;
  device: LxdOtherDevice;
  source: string;
}

export const getInheritedOtherDevices = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedOtherDevice[] => {
  return getInheritedDevices(values, profiles)
    .filter((item) => isOtherDevice(item.device))
    .map((item) => ({
      ...item,
      device: item.device as LxdOtherDevice,
    }));
};

export const getAppliedProfiles = (
  values: CreateInstanceFormValues | EditInstanceFormValues,
  profiles: LxdProfile[],
) => {
  return profiles
    .filter((profile) => values.profiles.includes(profile.name))
    .sort(
      (a, b) =>
        values.profiles.indexOf(b.name) - values.profiles.indexOf(a.name),
    );
};
