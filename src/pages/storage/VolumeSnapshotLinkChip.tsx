import type { FC } from "react";
import ResourceLink from "components/ResourceLink";
import type { LxdStorageVolume } from "types/storage";
import { linkForVolumeDetail } from "util/storageVolume";

interface Props {
  name: string;
  volume: LxdStorageVolume;
}

const VolumeSnapshotLinkChip: FC<Props> = ({ name, volume }) => {
  const baseUrl = linkForVolumeDetail(volume);

  return (
    <ResourceLink type="snapshot" value={name} to={`${baseUrl}/snapshots`} />
  );
};

export default VolumeSnapshotLinkChip;
