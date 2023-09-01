export const dirDriver = "dir";
export const btrfsDriver = "btrfs";
export const lvmDriver = "lvm";
export const zfsDriver = "zfs";

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
];

const storageDriverToSourceHelp: Record<string, string> = {
  dir: "Optional, Path to an existing directory",
  lvm: "Optional, Path to an existing block device, loop file or LVM volume group",
  zfs: "Optional, Path to an existing block device, loop file or ZFS dataset/pool",
};

export const getSourceHelpForDriver = (driver: string) => {
  if (Object.keys(storageDriverToSourceHelp).includes(driver)) {
    return storageDriverToSourceHelp[driver];
  }
  return "Not available";
};
