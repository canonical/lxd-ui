import type { LxdStorageVolume } from "types/storage";
import { isSnapshot } from "util/storageVolume";
import { fetchAllStorageVolumes } from "api/storage-volumes";

export const loadCustomVolumes = async (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdStorageVolume[]> => {
  const result: LxdStorageVolume[] = [];

  const volumes = await fetchAllStorageVolumes(project, isFineGrained);
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
