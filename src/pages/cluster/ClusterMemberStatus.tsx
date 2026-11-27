import type { FC } from "react";
import { useMemberLoading } from "context/memberLoading";
import { getClusterMemberStatusTone } from "util/clusterMember";
import type { LxdClusterMember } from "types/cluster";
import DsIcon from "components/DsIcon";
import StatusIcon from "components/StatusIcon";

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
      <StatusIcon
        tone={getClusterMemberStatusTone(member.status)}
        className="status-icon"
      />
      {member.status}
    </>
  );
};

export default ClusterMemberStatus;
