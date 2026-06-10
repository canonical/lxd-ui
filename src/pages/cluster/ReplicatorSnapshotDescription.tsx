import type { FC } from "react";
import type { LxdReplicator } from "types/replicator";

interface Props {
  replicator: LxdReplicator;
}

const ReplicatorSnapshotDescription: FC<Props> = ({ replicator }) => {
  return (
    <span className="replicator-snapshot-description">
      {replicator.config.snapshot === "true"
        ? "Create snapshots for incremental refresh, or use the latest scheduled one."
        : "Do not create snapshots for incremental refresh."}
    </span>
  );
};

export default ReplicatorSnapshotDescription;
