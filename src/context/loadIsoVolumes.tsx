import { fetchStoragePools, fetchStorageVolumes } from "api/storage-pools";
import { isoToRemoteImage } from "util/images";
import { RemoteImage } from "types/image";
import { LxdStorageVolume } from "types/storage";

export const loadIsoVolumes = async (
  project: string,
): Promise<RemoteImage[]> => {
  const remoteImages: RemoteImage[] = [];
  const allVolumes = await loadVolumes(project);
  allVolumes.forEach((volume) => {
    if (volume.content_type === "iso") {
      const image = isoToRemoteImage(volume);
      remoteImages.push(image);
    }
  });

  return remoteImages;
};

export const loadVolumes = async (
  project: string,
): Promise<LxdStorageVolume[]> => {
  const allVolumes: LxdStorageVolume[] = [];
  const pools = await fetchStoragePools(project);

  const poolVolumes = await Promise.allSettled(
    pools.map(async (pool) => fetchStorageVolumes(pool.name, project)),
  );

  poolVolumes.forEach((result) => {
    if (result.status === "fulfilled") {
      allVolumes.push(...result.value);
    } else {
      throw new Error("Failed to load iso images");
    }
  });

  return allVolumes;
};
