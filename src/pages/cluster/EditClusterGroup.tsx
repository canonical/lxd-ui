import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useParams } from "react-router-dom";
import { fetchClusterGroup } from "api/cluster";
import ClusterGroupForm from "pages/cluster/ClusterGroupForm";
import Loader from "components/Loader";
import { useNotify } from "@canonical/react-components";

const EditClusterGroup: FC = () => {
  const notify = useNotify();
  const { group: groupName } = useParams<{ group: string }>();

  if (!groupName) {
    return <>Missing groupName</>;
  }

  const { data: group, error } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.groups, groupName],
    queryFn: () => fetchClusterGroup(groupName),
  });

  if (error) {
    notify.failure("Loading cluster group failed", error);
  }

  return group ? <ClusterGroupForm group={group} /> : <Loader />;
};

export default EditClusterGroup;
