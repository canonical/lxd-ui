import { InstanceAndProfileFormValues } from "components/forms/instanceAndProfileFormValues";
import { LxdProfile } from "types/profile";
import { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import {
  isDiskDevice,
  isGPUDevice,
  isNicDevice,
  isOtherDevice,
  isProxyDevice,
} from "util/devices";
import {
  LxdDiskDevice,
  LxdGPUDevice,
  LxdNicDevice,
  LxdOtherDevice,
  LxdProxyDevice,
} from "types/device";
import { ProjectFormValues } from "pages/projects/CreateProject";
import { ConfigurationRowFormikValues } from "components/ConfigurationRow";
import { ConfigField } from "types/config";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchConfigOptions } from "api/server";
import { toConfigFields } from "util/config";
import { getInstanceKey } from "util/instanceConfigFields";
import { useParams } from "react-router-dom";
import { fetchProfiles } from "api/profiles";
import { getProjectKey } from "util/projectConfigFields";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { fetchStoragePool } from "api/storage-pools";
import { getVolumeKey } from "util/storageVolume";
import { getNetworkKey, networkFormTypeToOptionKey } from "util/networks";
import { getPoolKey, storagePoolFormDriverToOptionKey } from "./storagePool";
import { StoragePoolFormValues } from "pages/storage/forms/StoragePoolForm";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { useSettings } from "context/useSettings";

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
  }
};

const getConfigOptions = () => {
  const { hasMetadataConfiguration } = useSupportedFeatures();
  const { data: configOptions } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: () => fetchConfigOptions(hasMetadataConfiguration),
  });

  return configOptions;
};

const getInstanceRowMetadata = (
  values: InstanceAndProfileFormValues | ProjectFormValues,
  name: string,
): ConfigRowMetadata => {
  const configOptions = getConfigOptions();

  const configFields = toConfigFields(configOptions?.configs.instance ?? {});
  const configKey = getInstanceKey(name);
  const configField = configFields.find((item) => item.key === configKey);

  const { project } = useParams<{ project: string }>();
  const { data: profiles = [] } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project ?? ""),
    enabled: Boolean(project),
  });

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
  // when creating the defaults will be taken from the storage pool, if set there
  const { data: pool } = useQuery({
    queryKey: [queryKeys.storage, values.pool, values.project],
    queryFn: () => fetchStoragePool(values.pool, values.project),
    enabled: values.isCreating,
  });
  const poolField = `volume.${getVolumeKey(name)}`;
  if (pool?.config && poolField in pool.config) {
    return { value: pool.config[poolField], source: `${pool.name} pool` };
  }

  const configOptions = getConfigOptions();

  const optionKey = storagePoolFormDriverToOptionKey(pool?.driver ?? "zfs");
  const configFields = toConfigFields(configOptions?.configs[optionKey] ?? {});
  const configKey = getVolumeKey(name);
  const configField = configFields.find((item) => item.key === configKey);

  const lxdDefault =
    configField?.default && configField?.default.length > 0
      ? configField?.default
      : "-";

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

  const lxdDefault =
    configField?.default && configField?.default.length > 0
      ? configField?.default
      : "-";

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

  const lxdDefault =
    configField?.default && configField?.default.length > 0
      ? configField?.default
      : "-";

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

  const lxdDefault =
    configField?.default && configField?.default.length > 0
      ? configField?.default
      : "-";

  return { value: lxdDefault, source: "LXD", configField };
};

export const getInheritedRootStorage = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): [LxdDiskDevice | null, string] => {
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      const rootDevice = Object.values(profile.devices)
        .filter(isDiskDevice)
        .find((device) => device.path === "/");
      if (rootDevice) {
        return [rootDevice, `${profile.name} profile`];
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

export const getInheritedVolumes = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedVolume[] => {
  const inheritedVolumes: InheritedVolume[] = [];
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      Object.entries(profile.devices)
        .filter(([key, device]) => isDiskDevice(device) && key !== "root")
        .map(([key, disk]) => {
          inheritedVolumes.push({
            key: key,
            disk: disk as LxdDiskDevice,
            source: `${profile.name} profile`,
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

export const getInheritedNetworks = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedNetwork[] => {
  const inheritedNetworks: InheritedNetwork[] = [];
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      Object.entries(profile.devices)
        .filter(([_key, network]) => isNicDevice(network))
        .map(([key, network]) => {
          inheritedNetworks.push({
            key: key,
            network: network as LxdNicDevice,
            source: `${profile.name} profile`,
          });
        });
    }
  }

  return inheritedNetworks;
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
  const inheritedGPUs: InheritedGPU[] = [];
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      Object.entries(profile.devices)
        .filter(([_key, device]) => isGPUDevice(device))
        .map(([key, gpu]) => {
          inheritedGPUs.push({
            key: key,
            gpu: gpu as LxdGPUDevice,
            source: `${profile.name} profile`,
          });
        });
    }
  }

  return inheritedGPUs;
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
  const inheritedProxies: InheritedProxy[] = [];
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      Object.entries(profile.devices)
        .filter(([_key, device]) => isProxyDevice(device))
        .map(([key, proxy]) => {
          inheritedProxies.push({
            key: key,
            proxy: proxy as LxdProxyDevice,
            source: `${profile.name} profile`,
          });
        });
    }
  }

  return inheritedProxies;
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
  const inheritedDevices: InheritedOtherDevice[] = [];
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      Object.entries(profile.devices)
        .filter(([_key, device]) => isOtherDevice(device))
        .map(([key, device]) => {
          inheritedDevices.push({
            key: key,
            device: device as LxdOtherDevice,
            source: `${profile.name} profile`,
          });
        });
    }
  }

  return inheritedDevices;
};

const getAppliedProfiles = (
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
