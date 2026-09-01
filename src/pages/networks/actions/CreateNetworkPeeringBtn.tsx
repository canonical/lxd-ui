import type { FC } from "react";
import { Button } from "@canonical/react-components";
import {
  mediumScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";

import { useNetworkEntitlements } from "util/entitlements/networks";
import usePanelParams from "util/usePanelParams";
import type { LxdNetwork } from "types/network";
import classnames from "classnames";
import DsIcon from "components/DsIcon";

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
      hasIcon={!isMediumScreen}
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
      {!isMediumScreen && <DsIcon icon="plus" />}
      <span>{isMediumScreen ? "Create" : "Create local peering"}</span>
    </Button>
  );
};

export default CreateNetworkPeeringBtn;
