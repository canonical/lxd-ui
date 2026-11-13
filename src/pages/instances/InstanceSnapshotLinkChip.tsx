import type { FC } from "react";
import ResourceLink from "components/ResourceLink";
import { SNAPSHOT_PARAM } from "util/useSnapshotTablePagination";
import type { PartialWithRequired } from "types/partial";
import type { LxdInstance } from "types/instance";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  name: string;
  instance: PartialWithRequired<LxdInstance, "name" | "project">;
}

const InstanceSnapshotLinkChip: FC<Props> = ({ name, instance }) => {
  return (
    <ResourceLink
      type="snapshot"
      value={name}
      to={`${ROOT_PATH}/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/snapshots?${SNAPSHOT_PARAM}=${encodeURIComponent(name)}`}
    />
  );
};

export default InstanceSnapshotLinkChip;
