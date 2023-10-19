import { fetchStoragePools, fetchStorageVolumes } from "api/storage-pools";
import { LxdStorageVolume } from "types/storage";

export const loadCustomVolumes = async (
  project: string,
): Promise<LxdStorageVolume[]> => {
  const result: LxdStorageVolume[] = [];

  const pools = await fetchStoragePools(project);
  const volumePromises = pools.map(async (pool) =>
    fetchStorageVolumes(pool.name, project),
  );
  const poolVolumes = await Promise.all(volumePromises);

  poolVolumes.forEach((volumes, index) => {
    const pool = pools[index];
    volumes.forEach((volume) => {
      const contentTypes = ["filesystem", "block"];
      const isFilesystemOrBlock = contentTypes.includes(volume.content_type);
      const isCustom = volume.type === "custom";

      if (isCustom && isFilesystemOrBlock) {
        result.push({ ...volume, pool: pool.name });
      }
    });
  });

  return result;
};
