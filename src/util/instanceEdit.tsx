import { LxdProfile } from "types/profile";
import { LxdInstance } from "types/instance";
import { parseDevices } from "util/formDevices";
import { parseCpuLimit, parseMemoryLimit } from "util/limits";

const getEdit = (item: LxdProfile | LxdInstance) => {
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

    security_protection_delete: item.config["security.protection.delete"],
    security_privileged: item.config["security.privileged"],
    security_protection_shift: item.config["security.protection.shift"],
    security_idmap_base: item.config["security.idmap.base"],
    security_idmap_size: item.config["security.idmap.size"]
      ? parseInt(item.config["security.idmap.size"])
      : undefined,
    security_idmap_isolated: item.config["security.idmap.isolated"],
    security_devlxd: item.config["security.devlxd"],
    security_devlxd_images: item.config["security.devlxd.images"],
    security_secureboot: item.config["security.secureboot"],

    snapshots_pattern: item.config["snapshots.pattern"],
    snapshots_expiry: item.config["snapshots.expiry"],
    snapshots_schedule: item.config["snapshots.schedule"],
    snapshots_schedule_stopped: item.config["snapshots.schedule.stopped"],

    cloud_init_network_config: item.config["cloud-init.network-config"],
    cloud_init_user_data: item.config["cloud-init.user-data"],
    cloud_init_vendor_data: item.config["cloud-init.vendor-data"],
  };
};

export const getInstanceEdit = getEdit;

export const getProfileEdit = getEdit;
