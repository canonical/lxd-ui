import type { LxdStorageVolume } from "types/storage";
import { isSnapshot } from "util/storageVolume";
import { loadVolumes } from "context/loadIsoVolumes";

export const loadCustomVolumes = async (
  project: string,
  hasStorageVolumesAll: boolean,
): Promise<LxdStorageVolume[]> => {
  const result: LxdStorageVolume[] = [];

  const volumes = await loadVolumes(project, hasStorageVolumesAll);
  volumes.forEach((volume) => {
    const contentTypes = ["filesystem", "block"];
    const isFilesystemOrBlock = contentTypes.includes(volume.content_type);
    const isCustom = volume.type === "custom";
    if (isCustom && isFilesystemOrBlock && !isSnapshot(volume)) {
      result.push(volume);
    }
  });

  return result;
};
