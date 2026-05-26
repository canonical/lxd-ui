import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import type { LxdReplicator, LxdReplicatorStatus } from "types/replicator";

interface Props {
  replicator: LxdReplicator;
}

const STATUS_ICONS: Record<LxdReplicatorStatus, string> = {
  Completed: "status-succeeded-small",
  Failed: "status-failed-small",
  Running: "status-running-small",
  Pending: "status-queued-small",
};

const ReplicatorStatus: FC<Props> = ({ replicator }) => {
  const status = replicator.last_run_status;
  const iconName = STATUS_ICONS[status] ?? "";

  return (
    <>
      <Icon name={iconName} className="status-icon" />
      {status}
    </>
  );
};

export default ReplicatorStatus;
