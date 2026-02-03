export interface ClusterRestrictionFormValues {
  restricted_cluster_groups?: string;
  restricted_cluster_target?: string;
}

export interface DeviceUsageRestrictionFormValues {
  restricted_devices_disk?: string;
  restricted_devices_disk_paths?: string;
  restricted_devices_gpu?: string;
  restricted_devices_infiniband?: string;
  restricted_devices_nic?: string;
  restricted_devices_pci?: string;
  restricted_devices_unix_block?: string;
  restricted_devices_unix_char?: string;
  restricted_devices_unix_hotplug?: string;
  restricted_devices_usb?: string;
}

export interface ProjectDetailsFormValues {
  name: string;
  description?: string;
  default_instance_storage_pool: string;
  restricted: boolean;
  features_images?: boolean;
  features_profiles?: boolean;
  features_networks?: boolean;
  features_networks_zones?: boolean;
  features_storage_buckets?: boolean;
  features_storage_volumes?: boolean;
  readOnly: boolean;
  entityType: "project";
  editRestriction?: string;
  default_project_network: string;
}

export interface ProjectResourceLimitsFormValues {
  limits_instances?: number;
  limits_containers?: number;
  limits_virtual_machines?: number;
  limits_disk?: string;
  limits_networks?: number;
  limits_cpu?: number;
  limits_memory?: string;
  limits_processes?: number;
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

export interface NetworkRestrictionFormValues {
  restricted_network_access?: string;
  restricted_network_subnets?: string;
  restricted_network_uplinks?: string;
  restricted_network_zones?: string;
}

export type ProjectFormValues = ProjectDetailsFormValues &
  ProjectResourceLimitsFormValues &
  ClusterRestrictionFormValues &
  InstanceRestrictionFormValues &
  DeviceUsageRestrictionFormValues &
  NetworkRestrictionFormValues;
