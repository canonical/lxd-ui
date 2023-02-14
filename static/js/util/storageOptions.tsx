export const storageDrivers = [
  {
    label: "Directory",
    value: "dir",
  },
  {
    label: "Btrfs",
    value: "btrfs",
  },
  {
    label: "LVM",
    value: "lvm",
  },
  {
    label: "ZFS",
    value: "zfs",
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
