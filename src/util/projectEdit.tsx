import { LxdProject } from "types/project";
import { ProjectFormValues } from "pages/projects/CreateProject";
import { isProjectWithProfiles } from "./projects";

export const getProjectEditValues = (
  project: LxdProject,
): ProjectFormValues => {
  return {
    name: project.name,
    readOnly: true,
    description: project.description,
    restricted: project.config.restricted === "true",
    features_images: project.config["features.images"] === "true",
    features_profiles: isProjectWithProfiles(project),
    features_networks: project.config["features.networks"] === "true",
    features_networks_zones:
      project.config["features.networks.zones"] === "true",
    features_storage_buckets:
      project.config["features.storage.buckets"] === "true",
    features_storage_volumes:
      project.config["features.storage.volumes"] === "true",
    entityType: "project",

    limits_instances: project.config["limits.instances"]
      ? parseInt(project.config["limits.instances"])
      : undefined,
    limits_containers: project.config["limits.containers"]
      ? parseInt(project.config["limits.containers"])
      : undefined,
    limits_virtual_machines: project.config["limits.virtual-machines"]
      ? parseInt(project.config["limits.virtual-machines"])
      : undefined,
    limits_disk: project.config["limits.disk"],
    limits_networks: project.config["limits.networks"]
      ? parseInt(project.config["limits.networks"])
      : undefined,
    limits_cpu: project.config["limits.cpu"]
      ? parseInt(project.config["limits.cpu"])
      : undefined,
    limits_memory: project.config["limits.memory"]
      ? parseInt(project.config["limits.memory"])
      : undefined,
    limits_processes: project.config["limits.processes"]
      ? parseInt(project.config["limits.processes"])
      : undefined,

    restricted_cluster_groups: project.config["restricted.cluster.groups"],
    restricted_cluster_target: project.config["restricted.cluster.target"],

    restricted_virtual_machines_low_level:
      project.config["restricted.virtual-machines.lowlevel"],
    restricted_containers_low_level:
      project.config["restricted.containers.lowlevel"],
    restricted_containers_nesting:
      project.config["restricted.containers.nesting"],
    restricted_containers_privilege:
      project.config["restricted.containers.privilege"],
    restricted_container_interception:
      project.config["restricted.containers.interception"],
    restrict_snapshots: project.config["restricted.snapshots"],
    restricted_idmap_uid: project.config["restricted.idmap.uid"],
    restricted_idmap_gid: project.config["restricted.idmap.gid"],

    restricted_devices_disk: project.config["restricted.devices.disk"],
    restricted_devices_disk_paths:
      project.config["restricted.devices.disk.paths"],
    restricted_devices_gpu: project.config["restricted.devices.gpu"],
    restricted_devices_infiniband:
      project.config["restricted.devices.infiniband"],
    restricted_devices_nic: project.config["restricted.devices.nic"],
    restricted_devices_pci: project.config["restricted.devices.pci"],
    restricted_devices_unix_block:
      project.config["restricted.devices.unix-block"],
    restricted_devices_unix_char:
      project.config["restricted.devices.unix-char"],
    restricted_devices_unix_hotplug:
      project.config["restricted.devices.unix-hotplug"],
    restricted_devices_usb: project.config["restricted.devices.usb"],

    restricted_network_access: project.config["restricted.networks.access"],
    restricted_network_subnets: project.config["restricted.networks.subnets"],
    restricted_network_uplinks: project.config["restricted.networks.uplinks"],
    restricted_network_zones: project.config["restricted.networks.zones"],
  };
};
