import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import type { LxdNetwork } from "types/network";
import { useNetworkEntitlements } from "util/entitlements/networks";

interface Props {
  network: LxdNetwork;
  localPeering: string;
}

const EditLocalPeerBtn: FC<Props> = ({ network, localPeering }) => {
  const panelParams = usePanelParams();
  const { canEditNetwork } = useNetworkEntitlements();
  const editRestriction = canEditNetwork(network)
    ? "Edit local peering"
    : "You do not have permission to edit this local peering";

  return (
    <Button
      key={`${localPeering}-edit`}
      appearance="base"
      hasIcon
      onClick={() => {
        panelParams.openEditLocalPeering(localPeering);
      }}
      title={editRestriction}
      disabled={!canEditNetwork(network)}
    >
      <Icon name="edit" />
    </Button>
  );
};

export default EditLocalPeerBtn;
