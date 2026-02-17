import type { FC } from "react";
import { useNetworkFromClusterMembers } from "context/useNetworks";
import type { LxdNetwork } from "types/network";
import { isNetwork } from "util/networks";

interface Props {
  network: LxdNetwork;
  project: string;
}

export const NetworkParentTooltipRow: FC<Props> = ({ network, project }) => {
  const { data: networksFromClusterMembers } = useNetworkFromClusterMembers(
    network.name,
    project,
  );
  if (networksFromClusterMembers && networksFromClusterMembers.length > 0) {
    const parents = networksFromClusterMembers
      .filter(isNetwork)
      .filter((n) => n !== undefined && n.config && n.config.parent)
      .map((n) => n.config.parent);

    if (parents.length === 0) return "-";

    const uniqueParents = [...new Set(parents)];
    return uniqueParents.length === 1
      ? uniqueParents[0]
      : `${uniqueParents.length} different parents`;
  }
  return network?.config.parent || "-";
};
