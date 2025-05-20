import type { FC } from "react";
import ResourceLink from "components/ResourceLink";
import type { LxdStorageVolume } from "types/storage";
import { linkForVolumeDetail } from "util/storageVolume";

interface Props {
  volume: LxdStorageVolume;
}

const VolumeLinkChip: FC<Props> = ({ volume }) => {
  return (
    <ResourceLink
      type="volume"
      value={volume.name}
      to={linkForVolumeDetail(volume)}
    />
  );
};

export default VolumeLinkChip;
