import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import {
  mediumScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";
import { useNetworkEntitlements } from "util/entitlements/networks";
import usePanelParams from "util/usePanelParams";
import type { LxdNetwork } from "types/network";
import classnames from "classnames";

interface Props {
  network: LxdNetwork;
  className?: string;
}

const CreateNetworkPeeringBtn: FC<Props> = ({ network, className }) => {
  const isMediumScreen = useIsScreenBelow(mediumScreenBreakpoint);
  const { canEditNetwork } = useNetworkEntitlements();
  const panelParams = usePanelParams();

  return (
    <Button
      appearance="positive"
      hasIcon
      onClick={() => {
        panelParams.openCreateLocalPeering();
      }}
      className={classnames(
        "p-button--positive network-create-action-btn",
        className,
      )}
      disabled={!canEditNetwork(network)}
      title={
        canEditNetwork(network)
          ? "Create local peering"
          : "You do not have permission to create local peerings for this network"
      }
    >
      <Icon name="plus" light />
      <span>{isMediumScreen ? "Create" : "Create local peering"}</span>
    </Button>
  );
};

export default CreateNetworkPeeringBtn;
