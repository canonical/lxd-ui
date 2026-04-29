import {
  getInstanceConfigKeys,
  getInstanceField,
  getProfileConfigKeys,
} from "util/instanceConfigFields";
import { isEmptyDevice, parseDevices } from "util/formDevices";
import type {
  BootFormValues,
  CloudInitFormValues,
  EditProfileFormValues,
  EditInstanceFormValues,
  MigrationFormValues,
  ProfileDetailsFormValues,
  ResourceLimitsFormValues,
  SecurityPoliciesFormValues,
  SnapshotFormValues,
  SshKeyFormValues,
  InstanceDetailsFormValues,
} from "types/forms/instanceAndProfile";
import type { LxdProfile } from "types/profile";
import type { LxdInstance } from "types/instance";
import type { LxdConfigPair } from "types/config";
import type { LxdProject } from "types/project";
import type { LxdStorageVolume } from "types/storage";
import { LOCAL_IMAGE, LOCAL_ISO } from "util/images";
import type { FormDevice } from "types/formDevice";
import { ISO_VOLUME_TYPE } from "util/devices";
import type { CpuLimit, MemoryLimit } from "types/limits";
import { CPU_LIMIT_TYPE } from "types/limits";
import { parseCpuLimit, parseMemoryLimit } from "util/limits";
import { parseSshKeys } from "util/instanceEdit";

export const getInstancePayload = (
  instance: LxdInstance,
  values: EditInstanceFormValues,
) => {
  const handledConfigKeys = getInstanceConfigKeys();
  const handledKeys = new Set([
    "name",
    "description",
    "type",
    "profiles",
    "devices",
    "config",
  ]);

  return {
    ...instanceEditDetailPayload(values),
    devices: formDeviceToPayload(values.devices),
    config: {
      ...instanceEditConfigPayload(values),
      ...resourceLimitsPayload(values),
      ...securityPoliciesPayload(values),
      ...snapshotsPayload(values),
      ...migrationPayload(values),
      ...bootPayload(values),
      ...cloudInitPayload(values),
      ...sshKeyPayload(values),
      ...getUnhandledKeyValues(instance.config, handledConfigKeys),
    },
    ...getUnhandledKeyValues(instance, handledKeys),
  };
};

export const instanceEditDetailPayload = (values: EditInstanceFormValues) => {
  return {
    name: values.name,
    description: values.description,
    type: values.instanceType,
    profiles: values.profiles,
  };
};

export const formDeviceToPayload = (devices: FormDevice[]) => {
  return devices
    .filter((item) => !isEmptyDevice(item))
    .reduce((obj, { name, ...item }) => {
      if (
        item.type === "unknown" ||
        item.type === "custom-nic" ||
        item.type === ISO_VOLUME_TYPE
      ) {
        return {
          ...obj,
          [name]: item.bare,
        };
      }
      if (item.type === "disk") {
        const { bare, ...rest } = item;
        item = { ...bare, ...rest };
      }
      if ("size" in item && !item.size?.match(/^\d/)) {
        delete item.size;
      }
      return {
        ...obj,
        [name]: item,
      };
    }, {});
};

export const instanceEditConfigPayload = (values: EditInstanceFormValues) => {
  return {
    [getInstanceField("placement_group")]: values.placement_group,
  };
};

export const resourceLimitsPayload = (values: ResourceLimitsFormValues) => {
  return {
    [getInstanceField("limits_cpu")]: cpuLimitToPayload(values.limits_cpu),
    [getInstanceField("limits_memory")]: memoryLimitToPayload(
      values.limits_memory,
    ),
    [getInstanceField("limits_memory_swap")]: values.limits_memory_swap,
    [getInstanceField("limits_disk_priority")]:
      values.limits_disk_priority?.toString(),
    [getInstanceField("limits_processes")]: values.limits_processes?.toString(),
  };
};

export const cpuLimitToPayload = (
  cpuLimit: CpuLimit | string | undefined,
): string | undefined => {
  if (!cpuLimit) {
    return undefined;
  }
  if (typeof cpuLimit === "string") {
    return cpuLimit;
  }
  switch (cpuLimit.selectedType) {
    case CPU_LIMIT_TYPE.DYNAMIC:
      return cpuLimit.dynamicValue?.toString();
    case CPU_LIMIT_TYPE.FIXED:
      if (
        cpuLimit.fixedValue?.includes(",") ||
        cpuLimit.fixedValue?.includes("-")
      ) {
        return cpuLimit.fixedValue;
      }
      if (cpuLimit.fixedValue) {
        const singleValue = +cpuLimit.fixedValue;
        return `${singleValue}-${singleValue}`;
      }
      return undefined;
  }
};

export const memoryLimitToPayload = (
  memoryLimit: MemoryLimit | undefined | string,
): string | undefined => {
  if (typeof memoryLimit === "string") {
    return memoryLimit;
  }
  if (!memoryLimit?.value) {
    return undefined;
  }
  return `${memoryLimit.value}${memoryLimit.unit}`;
};

export const securityPoliciesPayload = (values: SecurityPoliciesFormValues) => {
  return {
    [getInstanceField("security_protection_delete")]:
      values.security_protection_delete,
    [getInstanceField("security_privileged")]: values.security_privileged,
    [getInstanceField("security_nesting")]: values.security_nesting,
    [getInstanceField("security_protection_shift")]:
      values.security_protection_shift,
    [getInstanceField("security_idmap_base")]: values.security_idmap_base,
    [getInstanceField("security_idmap_size")]:
      values.security_idmap_size?.toString(),
    [getInstanceField("security_idmap_isolated")]:
      values.security_idmap_isolated,
    [getInstanceField("security_devlxd")]: values.security_devlxd,
    [getInstanceField("security_devlxd_images")]: values.security_devlxd_images,
    [getInstanceField("security_secureboot")]: values.security_secureboot,
    [getInstanceField("security_csm")]: values.security_csm,
  };
};

export const snapshotsPayload = (values: SnapshotFormValues) => {
  return {
    [getInstanceField("snapshots_pattern")]: values.snapshots_pattern,
    [getInstanceField("snapshots_schedule_stopped")]:
      values.snapshots_schedule_stopped,
    [getInstanceField("snapshots_schedule")]: values.snapshots_schedule,
    [getInstanceField("snapshots_expiry")]: values.snapshots_expiry,
  };
};

export const migrationPayload = (values: MigrationFormValues) => {
  return {
    [getInstanceField("migration_stateful")]: values.migration_stateful,
    [getInstanceField("cluster_evacuate")]: values.cluster_evacuate,
  };
};

export const bootPayload = (values: BootFormValues) => {
  return {
    [getInstanceField("boot_autostart")]: values.boot_autostart?.toString(),
    [getInstanceField("boot_autostart_delay")]:
      values.boot_autostart_delay?.toString(),
    [getInstanceField("boot_autostart_priority")]:
      values.boot_autostart_priority?.toString(),
    [getInstanceField("boot_host_shutdown_timeout")]:
      values.boot_host_shutdown_timeout?.toString(),
    [getInstanceField("boot_mode")]: values.boot_mode?.toString(),
    [getInstanceField("boot_stop_priority")]:
      values.boot_stop_priority?.toString(),
  };
};

export const cloudInitPayload = (values: CloudInitFormValues) => {
  return {
    [getInstanceField("cloud_init_network_config")]:
      values.cloud_init_network_config,
    [getInstanceField("cloud_init_user_data")]: values.cloud_init_user_data,
    [getInstanceField("cloud_init_vendor_data")]: values.cloud_init_vendor_data,
  };
};

export const sshKeyPayload = (values: SshKeyFormValues) => {
  const result: Record<string, string | undefined> = {};

  values.cloud_init_ssh_keys?.forEach((record) => {
    result[`cloud-init.ssh-keys.${record.name}`] =
      `${record.user}:${record.fingerprint}`;
  });

  return result;
};

export const getUnhandledKeyValues = (
  item:
    | LxdConfigPair
    | LxdInstance
    | LxdProfile
    | LxdProject
    | LxdStorageVolume,
  handledKeys: Set<string>,
) => {
  return Object.fromEntries(
    Object.entries(item).filter(
      ([key]) =>
        !handledKeys.has(key) && !key.startsWith("cloud-init.ssh-keys."),
    ),
  );
};

export const getProfilePayload = (
  profile: LxdProfile,
  values: EditProfileFormValues,
) => {
  const handledConfigKeys = getProfileConfigKeys();
  const handledKeys = new Set(["name", "description", "devices", "config"]);

  return {
    ...profileDetailPayload(values),
    devices: formDeviceToPayload(values.devices),
    config: {
      ...profileDetailConfigPayload(values),
      ...resourceLimitsPayload(values),
      ...securityPoliciesPayload(values),
      ...snapshotsPayload(values),
      ...migrationPayload(values),
      ...bootPayload(values),
      ...cloudInitPayload(values),
      ...sshKeyPayload(values),
      ...getUnhandledKeyValues(profile.config, handledConfigKeys),
    },
    ...getUnhandledKeyValues(profile, handledKeys),
  };
};

export const profileDetailPayload = (values: ProfileDetailsFormValues) => {
  return {
    name: values.name,
    description: values.description,
  };
};

export const profileDetailConfigPayload = (
  values: ProfileDetailsFormValues,
) => {
  return {
    [getInstanceField("placement_group")]: values.placement_group,
  };
};

export const instanceDetailPayload = (
  values: InstanceDetailsFormValues,
  hasImageRegistries: boolean,
) => {
  return {
    name: values.name,
    description: values.description,
    type: values.instanceType,
    profiles: values.profiles,
    source: getInstanceSource(values, hasImageRegistries),
  };
};

const getInstanceSource = (
  values: InstanceDetailsFormValues,
  hasImageRegistries: boolean,
) => {
  if (values.image?.registryName && hasImageRegistries) {
    return {
      alias: values.image?.aliases.split(",")[0],
      mode: "pull",
      image_registry: values.image?.registryName,
      type: "image",
    };
  }

  if (values.image?.server === LOCAL_IMAGE || values.image?.cached) {
    return {
      type: "image",
      certificate: "",
      fingerprint: values.image?.fingerprint,
      allow_inconsistent: false,
    };
  }

  if (values.image?.server === LOCAL_ISO) {
    return {
      type: "none",
      certificate: "",
      allow_inconsistent: false,
    };
  }

  // legacy image from hardcoded remote
  return {
    alias: values.image?.aliases.split(",")[0],
    mode: "pull",
    protocol: "simplestreams",
    server: values.image?.server,
    type: "image",
  };
};

export const getInstanceEditValues = (
  instance: LxdInstance,
  editRestriction?: string,
): EditInstanceFormValues => {
  return {
    instanceType: instance.type,
    profiles: instance.profiles,
    location: instance.location,
    isCreating: false,
    readOnly: true,
    entityType: "instance",
    editRestriction,
    ...getEditValues(instance),
  };
};

export const getProfileEditValues = (
  profile: LxdProfile,
  editRestriction?: string,
): EditProfileFormValues => {
  return {
    readOnly: true,
    entityType: "profile",
    editRestriction,
    ...getEditValues(profile),
  };
};

const getEditValues = (
  item: LxdProfile | LxdInstance,
): Omit<EditProfileFormValues, "entityType" | "readOnly"> => {
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

    placement_group: item.config["placement.group"],

    security_protection_delete: item.config["security.protection.delete"],
    security_privileged: item.config["security.privileged"],
    security_nesting: item.config["security.nesting"],
    security_protection_shift: item.config["security.protection.shift"],
    security_idmap_base: item.config["security.idmap.base"],
    security_idmap_size: item.config["security.idmap.size"]
      ? parseInt(item.config["security.idmap.size"])
      : undefined,
    security_idmap_isolated: item.config["security.idmap.isolated"],
    security_devlxd: item.config["security.devlxd"],
    security_devlxd_images: item.config["security.devlxd.images"],
    security_secureboot: item.config["security.secureboot"],
    security_csm: item.config["security.csm"],

    snapshots_pattern: item.config["snapshots.pattern"],
    snapshots_expiry: item.config["snapshots.expiry"],
    snapshots_schedule: item.config["snapshots.schedule"],
    snapshots_schedule_stopped: item.config["snapshots.schedule.stopped"],

    migration_stateful: item.config["migration.stateful"],
    cluster_evacuate: item.config["cluster.evacuate"],

    boot_autostart: item.config["boot.autostart"],
    boot_autostart_delay: item.config["boot.autostart.delay"],
    boot_autostart_priority: item.config["boot.autostart.priority"],
    boot_host_shutdown_timeout: item.config["boot.host_shutdown_timeout"],
    boot_mode: item.config["boot.mode"],
    boot_stop_priority: item.config["boot.stop.priority"],

    cloud_init_network_config: item.config["cloud-init.network-config"],
    cloud_init_user_data: item.config["cloud-init.user-data"],
    cloud_init_vendor_data: item.config["cloud-init.vendor-data"],
    cloud_init_ssh_keys: parseSshKeys(item),
  };
};
