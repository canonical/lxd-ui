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
  appearance?: string;
  isEmptyState?: boolean;
}

const CreateLoadBalancerPoolBtn: FC<Props> = ({
  network,
  className,
  appearance = "positive",
  isEmptyState = false,
}) => {
  const isMediumScreen = useIsScreenBelow(mediumScreenBreakpoint);
  const { canEditNetwork } = useNetworkEntitlements();
  const panelParams = usePanelParams();
  return (
    <Button
      appearance={appearance}
      className={classnames("network-create-action-btn", className)}
      hasIcon
      onClick={panelParams.openCreateLoadBalancerPool}
      disabled={!canEditNetwork(network)}
      title={
        canEditNetwork(network)
          ? "Create load balancer pool"
          : "You do not have permission to create load balancer pools for this network"
      }
    >
      <Icon name="plus" light={appearance === "positive"} />
      <span>
        {isEmptyState || !isMediumScreen
          ? "Create load balancer pool"
          : "Create"}
      </span>
    </Button>
  );
};

export default CreateLoadBalancerPoolBtn;
