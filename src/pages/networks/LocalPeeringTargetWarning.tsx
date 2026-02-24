import { Icon, Tooltip } from "@canonical/react-components";
import type { FC } from "react";
import { useNetwork } from "context/useNetworks";

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
        message={
          <div>
            <div>Target network has unrestricted ingress and egress.</div>
            <div>To enforce filtering, add ACLs to the target network.</div>
          </div>
        }
      >
        <Icon name="warning" />
      </Tooltip>
    )
  );
};

export default LocalPeeringTargetWarning;
