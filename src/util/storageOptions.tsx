export const dirDriver = "dir";
export const btrfsDriver = "btrfs";
export const lvmDriver = "lvm";
export const zfsDriver = "zfs";
export const cephDriver = "ceph";

export const storageDrivers = [
  {
    label: "Directory",
    value: dirDriver,
  },
  {
    label: "Btrfs",
    value: btrfsDriver,
  },
  {
    label: "LVM",
    value: lvmDriver,
  },
  {
    label: "ZFS",
    value: zfsDriver,
  },
  {
    label: "Ceph",
    value: cephDriver,
  },
];

const storageDriverToSourceHelp: Record<string, string> = {
  dir: "Optional, path to an existing directory",
  lvm: "Optional, path to an existing block device, loop file or LVM volume group",
  zfs: "Optional, path to an existing block device, loop file or ZFS dataset/pool",
  ceph: "Optional, OSD pool name",
};

export const getSourceHelpForDriver = (driver: string) => {
  if (Object.keys(storageDriverToSourceHelp).includes(driver)) {
    return storageDriverToSourceHelp[driver];
  }
  return "Not available";
};

export const driversWithFilesystemSupport = [zfsDriver, lvmDriver, cephDriver];
