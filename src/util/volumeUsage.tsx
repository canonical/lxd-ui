import type { LxdDiskDevice } from "types/device";
import type { LxdProfile } from "types/profile";
import type { LxdStorageVolume } from "types/storage";
import { filterUsedByType } from "util/usedBy";

// Number of instances using the custom volume of a disk device, directly or
// through a profile. Volumes on a local pool share a name across cluster
// members, so only the volume on the given location counts when one is given.
// Returns null when the volume or a profile using it is not in the lists.
export const getDeviceVolumeInstanceCount = (
  device: LxdDiskDevice,
  volumes: LxdStorageVolume[],
  profiles: LxdProfile[],
  location?: string,
): number | null => {
  const candidates = volumes.filter(
    (volume) =>
      volume.type === "custom" &&
      volume.pool === device.pool &&
      volume.name === device.source,
  );
  const matches =
    location && candidates.length > 1
      ? candidates.filter((volume) => volume.location === location)
      : candidates;
  if (matches.length === 0) {
    return null;
  }

  const instances = new Set<string>();
  const addInstances = (usedBy?: string[]) => {
    filterUsedByType("instance", usedBy).forEach((instance) =>
      instances.add(`${instance.project}/${instance.name}`),
    );
  };

  for (const volume of matches) {
    addInstances(volume.used_by);
    for (const usedByProfile of filterUsedByType("profile", volume.used_by)) {
      const profile = profiles.find(
        (item) =>
          item.name === usedByProfile.name &&
          (!item.project || item.project === usedByProfile.project),
      );
      if (!profile) {
        return null;
      }
      addInstances(profile.used_by);
    }
  }

  return instances.size;
};
