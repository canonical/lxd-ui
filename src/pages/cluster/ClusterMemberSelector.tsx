import { Select, SelectProps } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchClusterMembers } from "api/cluster";
import { useSettings } from "context/useSettings";
import React, { FC } from "react";
import { queryKeys } from "util/queryKeys";
import { isClusteredServer } from "util/settings";

const ClusterMemberSelector: FC<SelectProps> = ({
  label,
  disabled,
  ...props
}) => {
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);
  const { data: clusterMembers = [], isLoading: clusterMembersLoading } =
    useQuery({
      queryKey: [queryKeys.cluster],
      queryFn: fetchClusterMembers,
      enabled: isClustered,
    });

  return isClustered ? (
    <Select
      {...props}
      label={label ?? "Cluster member"}
      options={clusterMembers.map((clusterMember) => {
        return {
          label: clusterMember.server_name,
          value: clusterMember.server_name,
        };
      })}
      disabled={disabled || clusterMembersLoading}
    />
  ) : null;
};

export default ClusterMemberSelector;
