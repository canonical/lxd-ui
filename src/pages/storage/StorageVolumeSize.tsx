import { FC } from "react";
import { fetchStorageVolumeState } from "api/storage-pools";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { LxdStorageVolume } from "types/storage";
import { humanFileSize } from "util/helpers";
import { fetchImageList } from "api/images";

interface Props {
  volume: LxdStorageVolume;
}

const StorageVolumeSize: FC<Props> = ({ volume }) => {
  const { data: volumeState } = useQuery({
    queryKey: [
      queryKeys.storage,
      volume.pool,
      volume.type,
      volume.name,
      volume.project,
    ],
    queryFn: () =>
      fetchStorageVolumeState(
        volume.pool,
        volume.project,
        volume.type,
        volume.name,
      ),
    enabled: volume.type !== "image",
  });

  const { data: images = [] } = useQuery({
    queryKey: [queryKeys.images, volume.project],
    queryFn: () => fetchImageList(volume.project),
    enabled: volume.type === "image",
  });

  const getUsed = () => {
    if (volume.type === "image") {
      return images.find((image) => image.fingerprint === volume.name)?.size;
    }
    return volumeState?.usage?.used;
  };

  const used = getUsed();

  return <>{used ? humanFileSize(used) : "-"}</>;
};

export default StorageVolumeSize;
