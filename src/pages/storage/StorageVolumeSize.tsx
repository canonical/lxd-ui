import type { FC } from "react";
import { fetchStorageVolumeState } from "api/storage-pools";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdStorageVolume } from "types/storage";
import { humanFileSize } from "util/helpers";
import { useImagesInProject } from "context/useImages";

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
    queryFn: async () =>
      fetchStorageVolumeState(
        volume.pool,
        volume.project,
        volume.type,
        volume.name,
      ),
    enabled: volume.type !== "image",
  });

  const imageQueryEnabled = volume.type === "image";
  const { data: images = [] } = useImagesInProject(
    volume.project,
    imageQueryEnabled,
  );

  const getUsed = () => {
    if (volume.type === "image") {
      return images.find((image) => image.fingerprint === volume.name)?.size;
    }
    return volumeState?.usage?.used ?? 0;
  };

  const used = getUsed();

  return <>{used ? humanFileSize(used) : "-"}</>;
};

export default StorageVolumeSize;
