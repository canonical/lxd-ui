import type { FC } from "react";
import { useSearchParams } from "react-router-dom";
import ResourceLink from "components/ResourceLink";
import {
  QUERY,
  STATUS,
  TYPE,
  PROFILE,
  CLUSTER_MEMBER,
} from "./InstanceSearchFilter";
import type { LxdInstance } from "types/instance";
import { searchChipBaseUrl } from "util/searchAndFilter";

interface Props {
  instance: LxdInstance;
}

const InstanceProjectChip: FC<Props> = ({ instance }) => {
  const [searchParams] = useSearchParams();

  const preserveParams = [QUERY, STATUS, TYPE, PROFILE, CLUSTER_MEMBER];
  const baseUrl = searchChipBaseUrl(searchParams, preserveParams);

  return (
    <ResourceLink
      type="project"
      value={instance.project}
      to={`${baseUrl}&project=${instance.project}`}
    />
  );
};

export default InstanceProjectChip;
