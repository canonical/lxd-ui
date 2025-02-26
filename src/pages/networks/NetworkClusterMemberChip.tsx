import type { FC } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ResourceLink from "components/ResourceLink";
import {
  MANAGED,
  QUERY,
  STATE,
  TYPE,
} from "pages/networks/NetworkSearchFilter";
import type { LXDNetworkOnClusterMember } from "types/network";

interface Props {
  network: LXDNetworkOnClusterMember;
}

const NetworkClusterMemberChip: FC<Props> = ({ network }) => {
  const { project } = useParams<{ project: string }>();
  const [searchParams] = useSearchParams();

  let href = `/ui/project/${project}/networks?search=${Number(searchParams.get("search")) + 1}`;
  const appendExistingSearchParams = (field: string) => {
    searchParams.getAll(field).forEach((item) => (href += `&${field}=${item}`));
  };
  appendExistingSearchParams(STATE);
  appendExistingSearchParams(TYPE);
  appendExistingSearchParams(MANAGED);
  appendExistingSearchParams(QUERY);

  return network.memberName === "Cluster-wide" ? (
    <ResourceLink
      type="cluster-group"
      value="Cluster wide"
      to={`${href}&member=Cluster-wide`}
    />
  ) : (
    <ResourceLink
      type="cluster-member"
      value={network.memberName}
      to={`${href}&member=${network.memberName}`}
    />
  );
};

export default NetworkClusterMemberChip;
