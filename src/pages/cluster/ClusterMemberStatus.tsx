import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { useMemberLoading } from "context/memberLoading";
import { getClusterMemberStatusIconName } from "util/clusterMember";
import type { LxdClusterMember } from "types/cluster";
import DsIcon from "components/DsIcon";

interface Props {
  member: LxdClusterMember;
}

const ClusterMemberStatus: FC<Props> = ({ member }) => {
  const memberLoading = useMemberLoading();
  const loadingType = memberLoading.getType(member.server_name);

  if (loadingType) {
    return (
      <>
        <DsIcon className="u-animation--spin status-icon" icon="spinner" />
        <i>{loadingType}</i>
      </>
    );
  }

  return (
    <>
      <Icon
        name={getClusterMemberStatusIconName(member.status)}
        className="status-icon"
      />
      {member.status}
    </>
  );
};

export default ClusterMemberStatus;
