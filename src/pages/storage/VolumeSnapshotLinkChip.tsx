import { FC } from "react";
import ResourceLink from "components/ResourceLink";
import { PartialWithRequired } from "types/partial";
import { LxdStorageVolume } from "types/storage";

interface Props {
  name: string;
  volume: PartialWithRequired<LxdStorageVolume, "name" | "project" | "pool">;
}

const VolumeSnapshotLinkChip: FC<Props> = ({ name, volume }) => {
  return (
    <ResourceLink
      type="snapshot"
      value={name}
      to={`/ui/project/${volume.project}/storage/pool/${volume.pool}/volumes/custom/${volume.name}/snapshots`}
    />
  );
};

export default VolumeSnapshotLinkChip;
