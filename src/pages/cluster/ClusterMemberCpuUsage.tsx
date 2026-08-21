import type { FC } from "react";
import { Spinner } from "@canonical/react-components";
import Meter from "components/Meter";
import { useClusterMemberState } from "context/useClusterMemberState";
import type { LxdClusterMember } from "types/cluster";
import { getCpuText } from "util/resourceDetails";

interface Props {
  member: LxdClusterMember;
}

const ClusterMemberCpuUsage: FC<Props> = ({ member }) => {
  const { data: state, isLoading } = useClusterMemberState(member.server_name);

  const totalCores = state?.sysinfo?.logical_cpus ?? 0;
  const used = state?.sysinfo?.load_averages?.[0] ?? 0;

  if (isLoading) {
    return <Spinner className="u-loader" />;
  }

  if (!totalCores) {
    return <span className="u-text--muted">-</span>;
  }

  const cpuPercentage = Math.min(100, (used / totalCores) * 100);

  return (
    <Meter
      percentage={cpuPercentage}
      text={getCpuText({
        total: totalCores,
        percentage: cpuPercentage,
      })}
      ariaLabelledby="total-cpu-label"
      isSegmented
      totalSegments={totalCores}
    />
  );
};

export default ClusterMemberCpuUsage;
