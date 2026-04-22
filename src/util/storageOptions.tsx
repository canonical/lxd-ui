import type { CustomSelectOption } from "@canonical/react-components";
import type { LxdSettings } from "types/server";

export const dirDriver = "dir";
export const btrfsDriver = "btrfs";
export const lvmDriver = "lvm";
export const zfsDriver = "zfs";
export const cephDriver = "ceph";
export const cephFSDriver = "cephfs";
export const cephObject = "cephobject";
export const powerFlex = "powerflex";
export const powerStore = "powerstore";
export const pureStorage = "pure";
export const alletraDriver = "alletra";

export const storageDriverLabels: { [key: string]: string } = {
  [dirDriver]: "Directory",
  [btrfsDriver]: "Btrfs",
  [lvmDriver]: "LVM",
  [zfsDriver]: "ZFS",
  [cephDriver]: "Ceph",
  [cephFSDriver]: "CephFS",
  [powerFlex]: "Dell PowerFlex",
  [powerStore]: "Dell PowerStore",
  [pureStorage]: "Pure Storage",
  [cephObject]: "Ceph Object",
  [alletraDriver]: "HPE Alletra",
};

export const storageDriverDescriptions: { [key: string]: string } = {
  [alletraDriver]: "HPE Alletra block storage",
  [btrfsDriver]:
    "Copy-on-Write filesystem with native subvolumes and snapshots",
  [cephDriver]: "Distributed Ceph RBD block storage",
  [cephFSDriver]: "Distributed Ceph filesystem",
  [cephObject]: "S3-compatible Ceph object storage via RADOS gateway",
  [dirDriver]: "Basic local directory (no native snapshots or quotas)",
  [lvmDriver]: "Logical volume-backed block storage with thin provisioning",
  [powerFlex]: "Dell PowerFlex software-defined block storage",
  [powerStore]: "Purpose-built all-flash block and file storage appliance",
  [pureStorage]: "Pure Storage FlashArray block storage",
  [zfsDriver]:
    "Advanced Copy-on-Write filesystem with datasets and zvols (recommended)",
};

const bucketCompatibleDrivers = [cephObject];
const driversWithClusterWideSource = [cephDriver, cephFSDriver];

export const isBucketCompatibleDriver = (driver: string): boolean => {
  return bucketCompatibleDrivers.includes(driver);
};

export const isClusterWideSourceDriver = (driver: string): boolean => {
  return driversWithClusterWideSource.includes(driver);
};

export const getStorageDriverOptions = (
  settings?: LxdSettings,
): CustomSelectOption[] => {
  const serverSupportedStorageDrivers =
    settings?.environment?.storage_supported_drivers || [];

  const storageDriverOptions: CustomSelectOption[] = [];

  for (const driver of serverSupportedStorageDrivers) {
    const text = storageDriverLabels[driver.Name];
    const description = storageDriverDescriptions[driver.Name];
    if (text) {
      storageDriverOptions.push({
        value: driver.Name,
        text: text,
        label: (
          <div className="storage-driver-label">
            <span className="storage-driver-name">{text}</span>
            {description && (
              <span className="storage-driver-description u-text--muted">
                {description}
              </span>
            )}
          </div>
        ),
      });
    }
  }

  return storageDriverOptions.sort((a, b) =>
    (a.text as string).localeCompare(b.text as string),
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
  return [cephDriver, cephFSDriver, cephObject, powerFlex, powerStore].includes(
    driver,
  );
};
