import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useNetworkEntitlements } from "util/entitlements/networks";
import usePanelParams from "util/usePanelParams";
import type { LxdNetwork } from "types/network";

interface Props {
  network: LxdNetwork;
  className?: string;
  appearance?: string;
  hasIcon?: boolean;
}

const CreateLoadBalancerPoolBtn: FC<Props> = ({
  network,
  className,
  appearance = "positive",
  hasIcon = true,
}) => {
  const isSmallScreen = useIsScreenBelow();
  const { canEditNetwork } = useNetworkEntitlements();
  const panelParams = usePanelParams();
  const showIcon = !isSmallScreen && hasIcon;

  return (
    <Button
      appearance={appearance}
      className={className}
      hasIcon={showIcon}
      onClick={panelParams.openCreateLoadBalancerPool}
      disabled={!canEditNetwork(network)}
      title={
        canEditNetwork(network)
          ? "Create load balancer pool"
          : "You do not have permission to create load balancer pools for this network"
      }
    >
      {showIcon && <Icon name="plus" light />}
      <span>Create load balancer pool</span>
    </Button>
  );
};

export default CreateLoadBalancerPoolBtn;
