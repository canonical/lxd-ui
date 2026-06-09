import type { FC } from "react";
import ResourceLink from "components/ResourceLink";
import type { LxdStorageVolume } from "types/storage";
import { getVolumeDetailUrl } from "util/storageVolume";

interface Props {
  volume: LxdStorageVolume;
}

const VolumeLinkChip: FC<Props> = ({ volume }) => {
  return (
    <ResourceLink
      type="volume"
      value={volume.name}
      to={getVolumeDetailUrl(volume)}
    />
  );
};

export default VolumeLinkChip;
