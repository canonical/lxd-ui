import type { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import Meter from "components/Meter";
import { queryKeys } from "util/queryKeys";
import { humanFileSize } from "util/helpers";
import type { LxdClusterMember } from "types/cluster";
import { fetchResources } from "api/server";

interface Props {
  member: LxdClusterMember;
}

const ClusterMemberMemoryUsage: FC<Props> = ({ member }) => {
  const { data: resources } = useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      member?.server_name ?? undefined,
      queryKeys.resources,
    ],
    queryFn: async () => fetchResources(member?.server_name),
  });

  const totalMemory = resources?.memory?.total ?? 0;
  const usedMemory = resources?.memory?.used ?? 0;

  if (totalMemory === 0) {
    return <span className="u-text--muted">-</span>;
  }

  const memoryPercentage = (usedMemory / totalMemory) * 100;

  const memoryText = `${humanFileSize(usedMemory)} of ${humanFileSize(totalMemory)}`;

  return <Meter percentage={memoryPercentage} text={memoryText} />;
};

export default ClusterMemberMemoryUsage;
