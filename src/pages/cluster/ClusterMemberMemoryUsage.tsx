import type { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import Meter from "components/Meter";
import { fetchClusterMemberState } from "api/cluster-members";
import { queryKeys } from "util/queryKeys";
import { humanFileSize } from "util/helpers";
import type { LxdClusterMember } from "types/cluster";

interface Props {
  member: LxdClusterMember;
}

const ClusterMemberMemoryUsage: FC<Props> = ({ member }) => {
  const { data: state } = useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      member.server_name,
      queryKeys.state,
    ],
    queryFn: async () => fetchClusterMemberState(member.server_name),
  });

  const totalMemory = state?.sysinfo?.total_ram ?? 0;

  if (!state?.sysinfo || totalMemory === 0) {
    return <span className="u-text--muted">-</span>;
  }

  const freeMemory = state?.sysinfo.free_ram ?? 0;
  const sharedMemory = state?.sysinfo.shared_ram ?? 0;
  const bufferedMemory = state?.sysinfo.buffered_ram ?? 0;

  const usedMemory = totalMemory - freeMemory;
  const memoryPercentage = (usedMemory / totalMemory) * 100;
  const secondaryMemory = sharedMemory + bufferedMemory;
  const secondaryPercentage = (secondaryMemory / totalMemory) * 100;

  const memoryText = `${humanFileSize(usedMemory)} of ${humanFileSize(totalMemory)}`;

  let hoverText = `free: ${humanFileSize(freeMemory)}\n`;
  hoverText += `used: ${humanFileSize(usedMemory)}\n`;
  hoverText += `cached: ${humanFileSize(bufferedMemory + sharedMemory)}\n`;

  return (
    <Meter
      percentage={memoryPercentage}
      secondaryPercentage={secondaryPercentage}
      text={memoryText}
      hoverText={hoverText}
    />
  );
};

export default ClusterMemberMemoryUsage;
