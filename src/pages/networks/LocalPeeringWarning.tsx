import { Notification } from "@canonical/react-components";
import type { FC } from "react";
import type { LxdNetwork } from "types/network";

interface Props {
  network: LxdNetwork;
}

const LocalPeeringWarning: FC<Props> = ({ network }) => {
  const networkACLs = network.config["security.acls"];
  return (
    (!networkACLs || networkACLs?.length == 0) && (
      <Notification
        severity="caution"
        title="No ACLs configured for this network."
      >
        Local peerings have unrestricted ingress and egress on this network. To
        enforce filtering, add ACLs to the network configuration.
      </Notification>
    )
  );
};

export default LocalPeeringWarning;
