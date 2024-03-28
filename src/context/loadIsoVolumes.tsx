import { fetchAllStorageVolumes } from "api/storage-pools";
import { isoToRemoteImage } from "util/images";
import { RemoteImage } from "types/image";

export const loadIsoVolumes = async (
  project: string,
): Promise<RemoteImage[]> => {
  const remoteImages: RemoteImage[] = [];
  const allVolumes = await fetchAllStorageVolumes(project);
  allVolumes.forEach((volume) => {
    if (volume.content_type === "iso") {
      const image = isoToRemoteImage(volume);
      remoteImages.push(image);
    }
  });

  return remoteImages;
};
