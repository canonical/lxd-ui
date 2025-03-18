import type { SelectProps } from "@canonical/react-components";
import { Select } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchClusterMembers } from "api/cluster";
import type { FC } from "react";
import { useEffect } from "react";
import { queryKeys } from "util/queryKeys";
import { useIsClustered } from "context/useIsClustered";

interface Props {
  setMember?: (member: string) => void;
  disableReason?: string;
}

const ClusterMemberSelector: FC<SelectProps & Props> = ({
  label,
  disabled,
  setMember,
  disableReason,
  ...props
}) => {
  const isClustered = useIsClustered();
  const { data: clusterMembers = [], isLoading: clusterMembersLoading } =
    useQuery({
      queryKey: [queryKeys.cluster],
      queryFn: fetchClusterMembers,
      enabled: isClustered,
    });

  useEffect(() => {
    if (clusterMembers.length > 0 && setMember) {
      setMember(clusterMembers[0].server_name);
    }
  }, [clusterMembers]);

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
      disabled={disabled || clusterMembersLoading || !!disableReason}
      help={disableReason}
    />
  ) : null;
};

export default ClusterMemberSelector;
