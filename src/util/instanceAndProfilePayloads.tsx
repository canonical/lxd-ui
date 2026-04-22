import {
  getInstanceField,
  getProfileConfigKeys,
} from "util/instanceConfigFields";
import { formDeviceToPayload } from "util/formDevices";
import { cpuLimitToPayload, memoryLimitToPayload } from "util/limits";
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
} from "types/forms/instanceAndProfile";
import type { LxdProfile } from "types/profile";
import type { LxdInstance } from "types/instance";
import type { LxdConfigPair } from "types/config";
import type { LxdProject } from "types/project";
import type { LxdStorageVolume } from "types/storage";

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

export const instanceEditDetailPayload = (values: EditInstanceFormValues) => {
  return {
    name: values.name,
    description: values.description,
    type: values.instanceType,
    profiles: values.profiles,
  };
};

export const instanceEditConfigPayload = (values: EditInstanceFormValues) => {
  return {
    [getInstanceField("placement_group")]: values.placement_group,
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
