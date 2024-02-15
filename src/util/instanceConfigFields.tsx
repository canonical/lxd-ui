const instanceConfigFormFieldsToPayload: Record<string, string> = {
  rootStorage: "",
  limits_cpu: "limits.cpu",
  limits_memory: "limits.memory",
  limits_memory_swap: "limits.memory.swap",
  limits_disk_priority: "limits.disk.priority",
  limits_processes: "limits.processes",
  security_privileged: "security.privileged",
  security_protection_delete: "security.protection.delete",
  security_protection_shift: "security.protection.shift",
  security_idmap_base: "security.idmap.base",
  security_idmap_size: "security.idmap.size",
  security_idmap_isolated: "security.idmap.isolated",
  security_devlxd: "security.devlxd",
  security_devlxd_images: "security.devlxd.images",
  security_secureboot: "security.secureboot",
  snapshots_pattern: "snapshots.pattern",
  snapshots_expiry: "snapshots.expiry",
  snapshots_schedule: "snapshots.schedule",
  snapshots_schedule_stopped: "snapshots.schedule.stopped",
  cloud_init_network_config: "cloud-init.network-config",
  cloud_init_user_data: "cloud-init.user-data",
  cloud_init_vendor_data: "cloud-init.vendor-data",
};

export const getInstanceKey = (formField: string): string => {
  if (!(formField in instanceConfigFormFieldsToPayload)) {
    throw new Error(
      `Could not find ${formField} in instanceConfigFormFieldsToPayload`,
    );
  }
  return instanceConfigFormFieldsToPayload[formField];
};

const getConfigKeys = (): Set<string> => {
  return new Set(Object.values(instanceConfigFormFieldsToPayload));
};

export const getInstanceConfigKeys = getConfigKeys;

export const getProfileConfigKeys = getConfigKeys;
