import type { FC } from "react";
import type { LxdReplicator } from "types/replicator";
import { timeToString } from "util/helpers";

interface Props {
  replicator: LxdReplicator;
}
const ReplicatorRunTime: FC<Props> = ({ replicator }) => {
  return timeToString(replicator.last_run_at) || "Never";
};

export default ReplicatorRunTime;
