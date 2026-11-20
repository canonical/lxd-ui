import type { LxdDiskDevice } from "types/device";
import type { LxdProfile } from "types/profile";
import type { LxdStorageVolume } from "types/storage";
import { filterUsedByType, type LxdUsedBy } from "util/usedBy";
import { hasLocation, isCustomVolume } from "util/storageVolume";

// Custom volumes a disk device points to. An instance uses exactly one volume.
// A profile in a cluster can point to one volume per member, as volumes on a
// local pool share a name across cluster members.
export const getDeviceVolumes = (
  device: LxdDiskDevice,
  volumes: LxdStorageVolume[],
  location?: string,
): LxdStorageVolume[] => {
  return volumes.filter(
    (volume) =>
      isCustomVolume(volume) &&
      volume.pool === device.pool &&
      volume.name === device.source &&
      (!location || !hasLocation(volume) || volume.location === location),
  );
};

const getUsedByKey = (item: LxdUsedBy) => `${item.project}/${item.name}`;

const uniqueSorted = (items: LxdUsedBy[]): LxdUsedBy[] => {
  const byKey = new Map(items.map((item) => [getUsedByKey(item), item]));
  return [...byKey.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, item]) => item);
};

// Profiles that attach any of the volumes, possibly from other projects
export const getVolumeProfiles = (volumes: LxdStorageVolume[]): LxdUsedBy[] => {
  return uniqueSorted(
    volumes.flatMap((volume) => filterUsedByType("profile", volume.used_by)),
  );
};

// Instances using the volumes directly or through the profiles, sorted by
// project and name
export const getVolumeInstances = (
  volumes: LxdStorageVolume[],
  profiles: LxdProfile[],
): LxdUsedBy[] => {
  const usedBy = [...volumes, ...profiles].flatMap(
    (item) => item.used_by ?? [],
  );
  return uniqueSorted(filterUsedByType("instance", usedBy));
};
