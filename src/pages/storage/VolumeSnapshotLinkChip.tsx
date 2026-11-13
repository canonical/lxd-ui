import type { FC } from "react";
import ResourceLink from "components/ResourceLink";
import { SNAPSHOT_PARAM } from "util/useSnapshotTablePagination";
import type { LxdStorageVolume } from "types/storage";
import { getVolumeDetailUrl } from "util/storageVolume";

interface Props {
  name: string;
  volume: LxdStorageVolume;
}

const VolumeSnapshotLinkChip: FC<Props> = ({ name, volume }) => {
  const baseUrl = getVolumeDetailUrl(volume);

  return (
    <ResourceLink
      type="snapshot"
      value={name}
      to={`${baseUrl}/snapshots?${SNAPSHOT_PARAM}=${encodeURIComponent(name)}`}
    />
  );
};

export default VolumeSnapshotLinkChip;
