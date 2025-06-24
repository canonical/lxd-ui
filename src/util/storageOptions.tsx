import type { OptionHTMLAttributes } from "react";
import type { LxdSettings } from "types/server";

export const dirDriver = "dir";
export const btrfsDriver = "btrfs";
export const lvmDriver = "lvm";
export const zfsDriver = "zfs";
export const cephDriver = "ceph";
export const cephFSDriver = "cephfs";
export const cephObject = "cephobject";
export const powerFlex = "powerflex";
export const pureStorage = "pure";

const storageDriverLabels: { [key: string]: string } = {
  [dirDriver]: "Directory",
  [btrfsDriver]: "Btrfs",
  [lvmDriver]: "LVM",
  [zfsDriver]: "ZFS",
  [cephDriver]: "Ceph",
  [cephFSDriver]: "CephFS",
  [powerFlex]: "Dell PowerFlex",
  [pureStorage]: "Pure Storage",
  [cephObject]: "Ceph Object",
};

export const getStorageDriverOptions = (
  settings?: LxdSettings,
): OptionHTMLAttributes<HTMLOptionElement>[] => {
  const serverSupportedStorageDrivers =
    settings?.environment?.storage_supported_drivers || [];
  const storageDriverOptions: OptionHTMLAttributes<HTMLOptionElement>[] = [];
  for (const driver of serverSupportedStorageDrivers) {
    const label = storageDriverLabels[driver.Name];
    if (label) {
      storageDriverOptions.push({ label, value: driver.Name });
    }
  }

  return storageDriverOptions.sort((a, b) =>
    (a.label as string).localeCompare(b.label as string),
  );
};

export const getSupportedStorageDrivers = (
  settings?: LxdSettings,
): Set<string> => {
  return new Set(
    getStorageDriverOptions(settings).map((driver) => driver.value as string),
  );
};

const storageDriverToSourceHelp: Record<string, string> = {
  btrfs:
    "Optional, path to an existing block device, loop file or Btrfs subvolume",
  dir: "Optional, path to an existing directory",
  lvm: "Optional, path to an existing block device, loop file or LVM volume group",
  zfs: "Optional, path to an existing block device, loop file or ZFS dataset/pool",
  ceph: "Optional, OSD pool name",
  cephfs: "Optional, Existing CephFS file system or file system path to use",
};

export const getSourceHelpForDriver = (driver: string) => {
  if (Object.keys(storageDriverToSourceHelp).includes(driver)) {
    return storageDriverToSourceHelp[driver];
  }
  return "Not available";
};

export const driversWithFilesystemSupport = [
  zfsDriver,
  lvmDriver,
  cephDriver,
  pureStorage,
  cephObject,
];

export const isRemoteStorage = (driver: string) => {
  return [cephDriver, cephFSDriver, cephObject, powerFlex].includes(driver);
};
