import type { FC } from "react";
import { useSearchParams } from "react-router-dom";
import ResourceLink from "components/ResourceLink";
import {
  MANAGED,
  QUERY,
  STATE,
  TYPE,
} from "pages/networks/NetworkSearchFilter";
import type { LXDNetworkOnClusterMember } from "types/network";
import { searchChipBaseUrl } from "util/searchAndFilter";

interface Props {
  network: LXDNetworkOnClusterMember;
}

const NetworkClusterMemberChip: FC<Props> = ({ network }) => {
  const [searchParams] = useSearchParams();

  const preserveParams = [STATE, TYPE, MANAGED, QUERY];
  const baseUrl = searchChipBaseUrl(searchParams, preserveParams);

  return network.memberName === "Cluster-wide" ? (
    <ResourceLink
      type="cluster-group"
      value="Cluster wide"
      to={`${baseUrl}&member=Cluster-wide`}
    />
  ) : (
    <ResourceLink
      type="cluster-member"
      value={network.memberName}
      to={`${baseUrl}&member=${network.memberName}`}
    />
  );
};

export default NetworkClusterMemberChip;
