import type { SelectProps } from "@canonical/react-components";
import { Select } from "@canonical/react-components";
import type { FC } from "react";
import { useIsClustered } from "context/useIsClustered";
import { useClusterMembers } from "context/useClusterMembers";

interface Props {
  disableReason?: string;
}

const ClusterMemberSelector: FC<SelectProps & Props> = ({
  label,
  disabled,
  disableReason,
  ...props
}) => {
  const isClustered = useIsClustered();
  const { data: clusterMembers = [], isLoading } = useClusterMembers();

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
      disabled={disabled || isLoading || !!disableReason}
      help={disableReason ?? props.help}
    />
  ) : null;
};

export default ClusterMemberSelector;
