import type { FC } from "react";
import { useReplicatorLoading } from "context/replicatorLoading";
import type { LxdReplicator, LxdReplicatorStatus } from "types/replicator";
import type { StatusTone } from "util/statusColors";
import StatusIcon from "components/StatusIcon";

interface Props {
  replicator: LxdReplicator;
}

const STATUS_ICONS: Record<LxdReplicatorStatus, StatusTone> = {
  Completed: "positive",
  Failed: "negative",
  Running: "caution",
  Pending: "neutral",
};

const ReplicatorStatus: FC<Props> = ({ replicator }) => {
  const replicatorLoading = useReplicatorLoading();
  const status = replicatorLoading.getStatus(replicator);
  const statusTone = STATUS_ICONS[status] ?? "neutral";

  return (
    <>
      <StatusIcon tone={statusTone} className="status-icon" />
      {status}
    </>
  );
};

export default ReplicatorStatus;
