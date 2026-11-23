import type { FC } from "react";
import StatusIcon from "components/StatusIcon";
import type { LxdNetworkPeer } from "types/network";

interface Props {
  localPeering: LxdNetworkPeer;
}

const LocalPeeringStatusIcon: FC<Props> = ({ localPeering }) => {
  const getToneForStatus = (status: string) => {
    return (
      (
        {
          Pending: "caution",
          Created: "positive",
          Errored: "negative",
        } as const
      )[status] ?? "neutral"
    );
  };

  return (
    <>
      <StatusIcon
        tone={getToneForStatus(localPeering.status)}
        className="status-icon"
      />
      {localPeering.status}
    </>
  );
};

export default LocalPeeringStatusIcon;
