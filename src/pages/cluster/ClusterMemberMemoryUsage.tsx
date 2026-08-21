import type { FC } from "react";
import { Spinner } from "@canonical/react-components";
import Meter from "components/Meter";
import { useClusterMemberState } from "context/useClusterMemberState";
import { humanFileSize } from "util/helpers";
import type { LxdClusterMember } from "types/cluster";

interface Props {
  member: LxdClusterMember;
}

const ClusterMemberMemoryUsage: FC<Props> = ({ member }) => {
  const { data: state, isLoading } = useClusterMemberState(member.server_name);

  const sysinfo = state?.sysinfo;
  const totalMemory = sysinfo?.total_ram ?? 0;

  if (isLoading) {
    return <Spinner className="u-loader" />;
  }

  if (totalMemory === 0) {
    return <span className="u-text--muted">-</span>;
  }

  const usedMemory = Math.max(
    0,
    totalMemory - (sysinfo?.free_ram ?? 0) - (sysinfo?.buffered_ram ?? 0),
  );
  const memoryPercentage = (usedMemory / totalMemory) * 100;
  const memoryText = `${humanFileSize(usedMemory)} of ${humanFileSize(totalMemory)}`;

  return <Meter percentage={memoryPercentage} text={memoryText} />;
};

export default ClusterMemberMemoryUsage;
