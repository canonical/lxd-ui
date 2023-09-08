import { fetchStoragePools, fetchStorageVolumes } from "api/storage-pools";
import { isoToRemoteImage } from "util/images";
import { RemoteImage } from "types/image";

export const loadIsoImages = async (
  project: string
): Promise<RemoteImage[]> => {
  const result: RemoteImage[] = [];
  const pools = await fetchStoragePools(project);
  for (const pool of pools) {
    const volumes = await fetchStorageVolumes(pool.name, project);

    volumes.forEach((volume) => {
      if (volume.content_type === "iso") {
        const image = isoToRemoteImage(volume.name, pool.name);
        result.push(image);
      }
    });
  }
  return result;
};
