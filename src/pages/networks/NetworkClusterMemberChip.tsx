import type { FC } from "react";
import ResourceLink from "components/ResourceLink";
import type { LXDNetworkOnClusterMember } from "types/network";
import ClusterMemberRichChip from "pages/cluster/ClusterMemberRichChip";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  network: LXDNetworkOnClusterMember;
}

const NetworkClusterMemberChip: FC<Props> = ({ network }) => {
  return network.memberName === "Cluster-wide" ? (
    <ResourceLink
      type="cluster-group"
      value="Cluster wide"
      to={`${ROOT_PATH}/ui/cluster/members`}
    />
  ) : (
    <ClusterMemberRichChip clusterMember={network.memberName} />
  );
};

export default NetworkClusterMemberChip;
