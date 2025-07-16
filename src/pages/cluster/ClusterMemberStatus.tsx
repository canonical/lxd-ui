import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import type { LxdClusterMemberStatus } from "types/cluster";

interface Props {
  status: LxdClusterMemberStatus;
}

const ClusterMemberStatus: FC<Props> = ({ status }) => {
  const getIconName = () => {
    return (
      {
        Evacuated: "status-queued-small",
        Online: "status-succeeded-small",
        Offline: "status-failed-small",
        Blocked: "status-waiting-small",
      }[status] ?? ""
    );
  };

  return (
    <>
      <Icon name={getIconName()} className="status-icon" />
      {status}
    </>
  );
};

export default ClusterMemberStatus;
