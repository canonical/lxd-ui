import React from "react";
import Loader from "components/Loader";
import NoMatch from "components/NoMatch";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchClusterGroups } from "api/cluster";

interface Props {
  outlet: JSX.Element;
}

const ClusterGroupLoader = ({ outlet }: Props) => {
  const { group: activeGroup } = useParams<{ group: string }>();

  const { data: clusterGroups = [], isLoading } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.groups],
    queryFn: fetchClusterGroups,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (
    activeGroup &&
    !clusterGroups.some((group) => group.name === activeGroup)
  ) {
    return <NoMatch />;
  }

  return outlet;
};

export default ClusterGroupLoader;
