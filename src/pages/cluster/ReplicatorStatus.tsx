import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { useReplicatorLoading } from "context/replicatorLoading";
import type { LxdReplicator, LxdReplicatorStatus } from "types/replicator";

interface Props {
  replicator: LxdReplicator;
}

const STATUS_ICONS: Record<LxdReplicatorStatus, string> = {
  Completed: "status-succeeded-small",
  Failed: "status-failed-small",
  Running: "status-waiting-small",
  Pending: "status-queued-small",
};

const ReplicatorStatus: FC<Props> = ({ replicator }) => {
  const replicatorLoading = useReplicatorLoading();
  const status = replicatorLoading.getStatus(replicator);
  const iconName = STATUS_ICONS[status] ?? "";

  return (
    <>
      <Icon name={iconName} className="status-icon" />
      {status}
    </>
  );
};

export default ReplicatorStatus;
