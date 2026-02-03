import type { InstanceIconType } from "types/instance";
import type { RemoteImage } from "types/image";
import type { CpuLimit, MemoryLimit } from "types/limits";
import type { FormDevice } from "types/formDevice";

export interface BootFormValues {
  boot_autostart?: string;
  boot_autostart_delay?: string;
  boot_autostart_priority?: string;
  boot_host_shutdown_timeout?: string;
  boot_stop_priority?: string;
}

export interface CloudInitFormValues {
  cloud_init_network_config?: string;
  cloud_init_user_data?: string;
  cloud_init_vendor_data?: string;
}

export interface FormDeviceValues {
  devices: FormDevice[];
}

export interface InstanceDetailsFormValues {
  name?: string;
  description?: string;
  image?: RemoteImage;
  instanceType: InstanceIconType;
  profiles: string[];
  target?: string;
  placementGroup?: string;
  entityType: "instance";
  isCreating: boolean;
  readOnly: boolean;
  editRestriction?: string;
}

export interface InstanceEditDetailsFormValues {
  name: string;
  description?: string;
  instanceType: string;
  location: string;
  placement_group?: string;
  profiles: string[];
  entityType: "instance";
  isCreating: boolean;
  readOnly: boolean;
  editRestriction?: string;
}

export interface InstanceRestrictionFormValues {
  restricted_virtual_machines_low_level?: string;
  restricted_containers_low_level?: string;
  restricted_containers_nesting?: string;
  restricted_containers_privilege?: string;
  restricted_container_interception?: string;
  restrict_backups?: string;
  restrict_snapshots?: string;
  restricted_idmap_uid?: string;
  restricted_idmap_gid?: string;
}

export interface MigrationFormValues {
  migration_stateful?: string;
  cluster_evacuate?: string;
}

export interface ProfileDetailsFormValues {
  name: string;
  description?: string;
  entityType: "profile";
  placement_group?: string;
  readOnly: boolean;
  editRestriction?: string;
}

export interface ResourceLimitsFormValues {
  limits_cpu?: CpuLimit;
  limits_memory?: MemoryLimit;
  limits_memory_swap?: string;
  limits_disk_priority?: number;
  limits_processes?: number;
}

export interface SecurityPoliciesFormValues {
  security_protection_delete?: string;
  security_privileged?: string;
  security_nesting?: string;
  security_protection_shift?: string;
  security_idmap_base?: string;
  security_idmap_size?: number;
  security_idmap_isolated?: string;
  security_devlxd?: string;
  security_devlxd_images?: string;
  security_secureboot?: string;
  security_csm?: string;
}

export interface SnapshotFormValues {
  snapshots_pattern?: string;
  snapshots_expiry?: string;
  snapshots_schedule?: string;
  snapshots_schedule_stopped?: string;
}

export interface SshKey {
  id: string;
  name: string;
  user: string;
  fingerprint: string;
}

export interface SshKeyFormValues {
  cloud_init_ssh_keys: SshKey[];
}

export interface YamlFormValues {
  yaml?: string;
}

export type CreateInstanceFormValues = InstanceDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  MigrationFormValues &
  BootFormValues &
  CloudInitFormValues &
  SshKeyFormValues &
  YamlFormValues;

export type CreateProfileFormValues = ProfileDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  MigrationFormValues &
  BootFormValues &
  CloudInitFormValues &
  SshKeyFormValues &
  YamlFormValues;

export type EditInstanceFormValues = InstanceEditDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  MigrationFormValues &
  BootFormValues &
  CloudInitFormValues &
  SshKeyFormValues &
  YamlFormValues;

export type EditProfileFormValues = ProfileDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  MigrationFormValues &
  BootFormValues &
  CloudInitFormValues &
  SshKeyFormValues &
  YamlFormValues;

export type InstanceAndProfileFormValues =
  | CreateInstanceFormValues
  | EditInstanceFormValues
  | CreateProfileFormValues
  | EditProfileFormValues;
