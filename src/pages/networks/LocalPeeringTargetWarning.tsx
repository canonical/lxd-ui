import { Tooltip } from "@canonical/react-components";
import type { FC } from "react";
import { useNetwork } from "context/useNetworks";
import DsIcon from "components/DsIcon";

interface Props {
  network: string;
  project: string;
}

const LocalPeeringTargetWarning: FC<Props> = ({
  network: networkName,
  project,
}) => {
  const { data: network } = useNetwork(networkName, project);
  const networkACLs = network?.config["security.acls"];

  return (
    (!networkACLs || networkACLs?.length == 0) && (
      <Tooltip
        className="u-margin-left--small"
        message={
          <div>
            <div>Target network has unrestricted ingress and egress.</div>
            <div>To enforce filtering, add ACLs to the target network.</div>
          </div>
        }
      >
        <DsIcon icon="warning" />
      </Tooltip>
    )
  );
};

export default LocalPeeringTargetWarning;
