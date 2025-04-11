import type { FC } from "react";
import { useSearchParams } from "react-router-dom";
import ResourceLink from "components/ResourceLink";
import { QUERY, STATUS, TYPE, PROFILE, PROJECT } from "./InstanceSearchFilter";
import type { LxdInstance } from "types/instance";
import { searchChipBaseUrl } from "util/searchAndFilter";

interface Props {
  instance: LxdInstance;
}

const InstanceClusterMemberChip: FC<Props> = ({ instance }) => {
  const [searchParams] = useSearchParams();
  const preserveParams = [QUERY, STATUS, TYPE, PROFILE, PROJECT];
  const baseUrl = searchChipBaseUrl(searchParams, preserveParams);

  return (
    <ResourceLink
      type="cluster-member"
      value={instance.location}
      to={`${baseUrl}&member=${instance.location}`}
    />
  );
};

export default InstanceClusterMemberChip;
