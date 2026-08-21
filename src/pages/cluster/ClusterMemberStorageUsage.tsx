import type { FC } from "react";
import { Spinner } from "@canonical/react-components";
import Meter from "components/Meter";
import { useClusterMemberState } from "context/useClusterMemberState";
import type { LxdClusterMember } from "types/cluster";
import { humanFileSize } from "util/helpers";

interface Props {
  member: LxdClusterMember;
}

const ClusterMemberStorageUsage: FC<Props> = ({ member }) => {
  const { data: state, isLoading } = useClusterMemberState(member.server_name);

  if (isLoading) {
    return <Spinner className="u-loader" />;
  }

  const storagePools = Object.values(state?.storage_pools || {});
  const total = storagePools.reduce((acc, p) => acc + (p.space?.total || 0), 0);
  const used = storagePools.reduce((acc, p) => acc + (p.space?.used || 0), 0);

  if (!total) {
    return <span className="u-text--muted">-</span>;
  }

  const percentage = (used / total) * 100;
  const text = `${humanFileSize(used)} of ${humanFileSize(total)}`;

  return <Meter percentage={percentage} text={text} />;
};

export default ClusterMemberStorageUsage;
