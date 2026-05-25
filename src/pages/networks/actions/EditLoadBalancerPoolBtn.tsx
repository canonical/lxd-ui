import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import type { LxdNetwork } from "types/network";
import { useNetworkEntitlements } from "util/entitlements/networks";
import { CREATE_POOL_VALUE } from "util/loadBalancers";

interface Props {
  network: LxdNetwork;
  pool: string;
  hasCaption?: boolean;
}

const EditLoadBalancerPoolBtn: FC<Props> = ({
  network,
  pool,
  hasCaption = true,
}) => {
  const panelParams = usePanelParams();
  const { canEditNetwork } = useNetworkEntitlements();

  const getTitle = () => {
    if (!pool) {
      return "Select pool to edit";
    }

    if (pool === CREATE_POOL_VALUE) {
      return "Create a load balancer pool before you can edit it";
    }

    if (!canEditNetwork(network)) {
      return "You do not have permission to edit this load balancer pool";
    }

    return "Edit load balancer pool";
  };

  return (
    <Button
      onClick={() => {
        panelParams.openEditLoadBalancerPool(pool);
      }}
      appearance="base"
      hasIcon
      className="u-no-margin--bottom"
      type="button"
      title={getTitle()}
      disabled={
        pool === "" || pool === CREATE_POOL_VALUE || !canEditNetwork(network)
      }
    >
      <Icon name="edit" />
      {hasCaption && <span>Edit pool</span>}
    </Button>
  );
};

export default EditLoadBalancerPoolBtn;
