import type { FC } from "react";
import { Spinner } from "@canonical/react-components";
import Meter from "components/Meter";
import { useClusterMemberState } from "context/useClusterMemberState";
import { humanFileSize } from "util/helpers";
import type {
  LxdClusterMember,
  LxdClusterMemberWithState,
} from "types/cluster";
import { getMemoryText } from "util/resourceDetails";

interface Props {
  member: LxdClusterMember | LxdClusterMemberWithState;
}

const ClusterMemberMemoryUsage: FC<Props> = ({ member }) => {
  const hasMemberState = Object.hasOwn(member, "state");

  const { data: memberState, isLoading } = useClusterMemberState(
    member.server_name,
    member.status === "Online" && !hasMemberState,
  );

  const state = hasMemberState
    ? (member as LxdClusterMemberWithState).state
    : memberState;

  const sysinfo = state?.sysinfo;
  const totalMemory = sysinfo?.total_ram ?? 0;

  if (isLoading) {
    return <Spinner className="u-loader" />;
  }

  if (totalMemory === 0) {
    return <span className="u-text--muted">-</span>;
  }

  const freeMemory = sysinfo?.free_ram ?? 0;
  const bufferedMemory = sysinfo?.buffered_ram ?? 0;
  const usedMemory = Math.max(0, totalMemory - freeMemory - bufferedMemory);
  const memoryPercentage = (usedMemory / totalMemory) * 100;
  const bufferedMemoryPercentage = (bufferedMemory / totalMemory) * 100;
  const memoryText = getMemoryText(
    totalMemory - freeMemory,
    totalMemory,
    memoryPercentage + bufferedMemoryPercentage,
    true,
  );

  return (
    <Meter
      percentage={memoryPercentage}
      secondaryPercentage={bufferedMemoryPercentage}
      text={memoryText}
      hoverText={
        `free: ${humanFileSize(freeMemory)}\n` +
        `used: ${humanFileSize(usedMemory)}\n` +
        `buffered: ${humanFileSize(bufferedMemory)}\n`
      }
    />
  );
};

export default ClusterMemberMemoryUsage;
