import { useQueries } from "@tanstack/react-query";
import type { LxdInstance } from "types/instance";
import {
  getVolumeSnapshotsQuery,
  useLoadCustomVolumes,
} from "context/useVolumes";
import {
  getCustomVolumeSnapshotDevices,
  getSnapshotCustomVolumes,
} from "util/instanceSnapshots";

export const useCustomVolumeSnapshots = (instance: LxdInstance) => {
  const hasCustomVolumeSnapshots = !!instance.snapshots?.some(
    (snapshot) => getCustomVolumeSnapshotDevices(snapshot).length > 0,
  );
  const { data: customVolumes = [], isLoading: isCustomVolumesLoading } =
    useLoadCustomVolumes(instance.project, {
      enabled: hasCustomVolumeSnapshots,
    });
  const volumes = getSnapshotCustomVolumes(instance, customVolumes);
  const results = useQueries({
    queries: volumes.map(getVolumeSnapshotsQuery),
  });

  return {
    data: volumes.map((volume, index) => ({
      volume,
      snapshots: results[index].data ?? [],
    })),
    isLoading:
      isCustomVolumesLoading || results.some((result) => result.isLoading),
  };
};
