import { isoToRemoteImage } from "util/images";
import type { RemoteImage } from "types/image";
import { fetchAllStorageVolumes } from "api/storage-volumes";

export const loadIsoVolumes = async (
  project: string,
  isFineGrained: boolean | null,
): Promise<RemoteImage[]> => {
  const remoteImages: RemoteImage[] = [];
  const allVolumes = await fetchAllStorageVolumes(project, isFineGrained);
  allVolumes.forEach((volume) => {
    if (volume.content_type === "iso") {
      const image = isoToRemoteImage(volume);
      remoteImages.push(image);
    }
  });

  return remoteImages;
};
