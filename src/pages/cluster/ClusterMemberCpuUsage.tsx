import type { FC } from "react";
import Meter from "components/Meter";
import type { LxdClusterMemberWithState } from "types/cluster";
import { getCpuText } from "util/resourceDetails";

interface Props {
  member: LxdClusterMemberWithState;
}

const ClusterMemberCpuUsage: FC<Props> = ({ member }) => {
  const totalCores = member.state?.sysinfo?.logical_cpus ?? 0;
  const used = member.state?.sysinfo?.load_averages?.[0] ?? 0;

  if (!totalCores) {
    return <span className="u-text--muted">-</span>;
  }

  const cpuPercentage = Math.min(100, (used / totalCores) * 100);
  const labelId = `member-cpu-${encodeURIComponent(member.server_name)}`;

  return (
    <>
      <span
        id={labelId}
        className="u-off-screen"
      >{`CPU load average for ${member.server_name}`}</span>
      <Meter
        percentage={cpuPercentage}
        text={getCpuText(cpuPercentage, true)}
        ariaLabelledby={labelId}
      />
    </>
  );
};

export default ClusterMemberCpuUsage;
