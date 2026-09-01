import type { FC } from "react";
import {
  mediumScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";
import { Button } from "@canonical/react-components";
import { useNetworkEntitlements } from "util/entitlements/networks";
import type { LxdNetwork } from "types/network";
import classnames from "classnames";
import { useNavigate } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";
import { useLoadBalancerPools } from "context/useLoadBalancerPools";
import { useCurrentProject } from "context/useCurrentProject";
import DsIcon from "components/DsIcon";

interface Props {
  network: LxdNetwork;
  className?: string;
  appearance?: string;
  hasIcon?: boolean;
  isEmptyState?: boolean;
}

const CreateLoadBalancerBtn: FC<Props> = ({
  network,
  className,
  appearance = "positive",
  hasIcon = true,
  isEmptyState = false,
}) => {
  const isMediumScreen = useIsScreenBelow(mediumScreenBreakpoint);
  const { canEditNetwork } = useNetworkEntitlements();
  const navigate = useNavigate();
  const { projectName: project } = useCurrentProject();
  const { data: pools = [] } = useLoadBalancerPools(network.name, project);
  const hasPools = pools.length > 0;

  const getTitle = () => {
    if (!hasPools) {
      return "Create a load balancer pool to enable load balancer creation";
    }

    if (!canEditNetwork(network)) {
      return "You do not have permission to create load balancers for this network";
    }

    return "Create load balancer";
  };

  return (
    <Button
      appearance={appearance}
      hasIcon={!isMediumScreen && hasIcon}
      onClick={() => {
        navigate(
          `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/load-balancers/create`,
        );
      }}
      className={classnames("network-create-action-btn", className)}
      disabled={!canEditNetwork(network) || !hasPools}
      title={getTitle()}
    >
      {!isMediumScreen && hasIcon && <DsIcon icon="plus" />}
      <span>
        {isEmptyState || !isMediumScreen ? "Create load balancer" : "Create"}
      </span>{" "}
    </Button>
  );
};

export default CreateLoadBalancerBtn;
