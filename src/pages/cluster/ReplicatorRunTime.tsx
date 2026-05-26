import type { FC } from "react";
import type { LxdReplicator } from "types/replicator";
import { isoTimeToString } from "util/helpers";

interface Props {
  replicator: LxdReplicator;
}
const ReplicatorRunTime: FC<Props> = ({ replicator }) => {
  return isoTimeToString(replicator.last_run_at) || "Never";
};

export default ReplicatorRunTime;
