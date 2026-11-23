import type { Query } from "@tanstack/react-query";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import type { LxdStorageVolume } from "types/storage";
import { checkDuplicateName, type AbortControllerState } from "./helpers";
import * as Yup from "yup";
import { testFutureDate, testValidDate, testValidTime } from "./snapshots";
import {
  ISO_VOLUME_NAME,
  ISO_VOLUME_PROFILE_NAME,
  isDiskDevice,
  isVolumeDevice,
} from "./devices";
import { queryKeys } from "./queryKeys";
import { filterUsedByType } from "./usedBy";

/*** Instance snapshot utils ***/
export const isInstanceStateful = (instance: LxdInstance): boolean => {
  return Boolean(instance.config["migration.stateful"]);
};

export const CUSTOM_DISK_DEVICES_MESSAGE_SUFFIX =
  " and its exclusively attached custom disk devices";

// Device names of all custom volumes attached to the instance, without the
// ISO volumes the UI attaches
export const getCustomVolumeDevices = (instance: LxdInstance): string[] => {
  return Object.entries(instance.expanded_devices ?? {})
    .filter(
      ([name, device]) =>
        isDiskDevice(device) &&
        isVolumeDevice(device) &&
        name !== ISO_VOLUME_NAME &&
        name !== ISO_VOLUME_PROFILE_NAME,
    )
    .map(([name]) => name)
    .sort();
};

// Show a custom volume device by its mount path, falling back to the device
// name for block volumes or devices no longer attached to the instance
export const getCustomVolumeDeviceLabel = (
  instance: LxdInstance,
  deviceName: string,
): string => {
  const device = instance.expanded_devices?.[deviceName];
  if (device && isDiskDevice(device) && device.path) {
    return device.path;
  }
  return deviceName;
};

// Device names of the custom volumes LXD includes in a new instance snapshot.
// customVolumes holds no ISO volumes, and volumes used by another instance are skipped.
// Volumes on a local pool share a name across cluster members, so the volume
// on the instance's member is picked.
export const getCustomVolumeDevicesToSnapshot = (
  instance: LxdInstance,
  customVolumes: LxdStorageVolume[],
): string[] => {
  return Object.entries(instance.expanded_devices ?? {})
    .filter(([, device]) => {
      if (!isDiskDevice(device) || !isVolumeDevice(device)) {
        return false;
      }
      const candidates = customVolumes.filter(
        (item) => item.pool === device.pool && item.name === device.source,
      );
      const volume =
        candidates.length === 1
          ? candidates[0]
          : candidates.find((item) => item.location === instance.location);
      if (!volume) {
        return false;
      }
      return filterUsedByType("instance", volume.used_by).every(
        (user) =>
          user.name === instance.name && user.project === instance.project,
      );
    })
    .map(([name]) => name)
    .sort();
};

// LXD records the custom volume snapshots taken along with an instance snapshot
// as a JSON map of device name to volume snapshot UUID.
// Returns null when the record can not be read.
const parseCustomVolumeSnapshotDevices = (
  snapshot: LxdInstanceSnapshot,
): string[] | null => {
  const attachedVolumes = snapshot.config["volatile.attached_volumes"];
  if (!attachedVolumes) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(attachedVolumes);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    return Object.keys(parsed).sort();
  } catch {
    return null;
  }
};

export const getCustomVolumeSnapshotDevices = (
  snapshot: LxdInstanceSnapshot,
): string[] => {
  return parseCustomVolumeSnapshotDevices(snapshot) ?? [];
};

export const hasUnreadableCustomVolumeSnapshotDevices = (
  snapshot: LxdInstanceSnapshot,
): boolean => {
  return parseCustomVolumeSnapshotDevices(snapshot) === null;
};

// snapshot actions that include custom volumes change the volume snapshots too
export const isInstanceSnapshotQuery =
  (includeCustomVolumes: boolean) =>
  (query: Query): boolean =>
    query.queryKey[0] === queryKeys.instances ||
    (includeCustomVolumes &&
      (query.queryKey[0] === queryKeys.volumes ||
        query.queryKey[0] === queryKeys.storage));

export const testDuplicateInstanceSnapshotName = (
  instance: LxdInstance,
  controllerState: AbortControllerState,
  excludeName?: string,
): [string, string, Yup.TestFunction<string | undefined, Yup.AnyObject>] => {
  return [
    "deduplicate",
    "Snapshot name already in use",
    async (value?: string) => {
      return (
        (excludeName && value === excludeName) ||
        checkDuplicateName(
          value,
          instance.project,
          controllerState,
          `instances/${encodeURIComponent(instance.name)}/snapshots`,
        )
      );
    },
  ];
};

export const getInstanceSnapshotSchema = (
  instance: LxdInstance,
  controllerState: AbortControllerState,
  snapshotName?: string,
) => {
  return Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateInstanceSnapshotName(
          instance,
          controllerState,
          snapshotName,
        ),
      )
      .matches(/^[A-Za-z0-9-_.:]+$/, {
        message:
          "Only alphanumeric characters, underscores, periods, hyphens, and colons are allowed in this field",
      }),
    expirationDate: Yup.string()
      .nullable()
      .optional()
      .test(...testValidDate())
      .test(...testFutureDate()),
    expirationTime: Yup.string()
      .nullable()
      .optional()
      .test(...testValidTime()),
    stateful: Yup.boolean(),
  });
};
