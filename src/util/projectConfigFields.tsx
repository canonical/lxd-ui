const projectConfigFormFieldsToPayload: Record<string, string> = {
  restricted_cluster_groups: "restricted.cluster.groups",
  restricted_cluster_target: "restricted.cluster.target",
  restricted_devices_disk: "restricted.devices.disk",
  restricted_devices_disk_paths: "restricted.devices.disk.paths",
  restricted_devices_gpu: "restricted.devices.gpu",
  restricted_devices_infiniband: "restricted.devices.infiniband",
  restricted_devices_nic: "restricted.devices.nic",
  restricted_devices_pci: "restricted.devices.pci",
  restricted_devices_unix_block: "restricted.devices.unix-block",
  restricted_devices_unix_char: "restricted.devices.unix-char",
  restricted_devices_unix_hotplug: "restricted.devices.unix-hotplug",
  restricted_devices_usb: "restricted.devices.usb",
  restricted_virtual_machines_low_level: "restricted.virtual-machines.lowlevel",
  restricted_containers_low_level: "restricted.containers.lowlevel",
  restricted_containers_nesting: "restricted.containers.nesting",
  restricted_containers_privilege: "restricted.containers.privilege",
  restricted_container_interception: "restricted.containers.interception",
  restrict_snapshots: "restricted.snapshots",
  restricted_idmap_uid: "restricted.idmap.uid",
  restricted_idmap_gid: "restricted.idmap.gid",
  restricted_network_access: "restricted.networks.access",
  restricted_network_subnets: "restricted.networks.subnets",
  restricted_network_uplinks: "restricted.networks.uplinks",
  restricted_network_zones: "restricted.networks.zones",
  restricted: "restricted",
  features_images: "features.images",
  features_profiles: "features.profiles",
  features_networks: "features.networks",
  features_networks_zones: "features.networks.zones",
  features_storage_buckets: "features.storage.buckets",
  features_storage_volumes: "features.storage.volumes",
  limits_instances: "limits.instances",
  limits_containers: "limits.containers",
  limits_virtual_machines: "limits.virtual-machines",
  limits_disk: "limits.disk",
  limits_networks: "limits.networks",
  limits_cpu: "limits.cpu",
  limits_memory: "limits.memory",
  limits_processes: "limits.processes",
};

export const getProjectKey = (formField: string) => {
  if (!(formField in projectConfigFormFieldsToPayload)) {
    throw new Error(
      `Could not find ${formField} in projectConfigFormFieldsToPayload`,
    );
  }
  return projectConfigFormFieldsToPayload[formField];
};

export const getProjectConfigKeys = () => {
  return new Set(Object.values(projectConfigFormFieldsToPayload));
};
