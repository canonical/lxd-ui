import { OptionHTMLAttributes } from "react";
import { LxdSettings } from "types/server";

export const dirDriver = "dir";
export const btrfsDriver = "btrfs";
export const lvmDriver = "lvm";
export const zfsDriver = "zfs";
export const cephDriver = "ceph";
export const powerFlex = "powerflex";

const storageDriverLabels: { [key: string]: string } = {
  [dirDriver]: "Directory",
  [btrfsDriver]: "Btrfs",
  [lvmDriver]: "LVM",
  [zfsDriver]: "ZFS",
  [cephDriver]: "Ceph",
  [powerFlex]: "Dell PowerFlex",
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
