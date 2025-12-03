import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import type { LxdNetworkPeer } from "types/network";

interface Props {
  localPeering: LxdNetworkPeer;
}

const LocalPeeringStatusIcon: FC<Props> = ({ localPeering }) => {
  const getIconNameForStatus = (status: string) => {
    return (
      {
        Pending: "status-waiting-small",
        Created: "status-succeeded-small",
        Errored: "status-failed-small",
      }[status] ?? ""
    );
  };

  return (
    <>
      <Icon
        name={getIconNameForStatus(localPeering.status)}
        className="status-icon"
      />
      {localPeering.status}
    </>
  );
};

export default LocalPeeringStatusIcon;
