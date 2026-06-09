import type { FC } from "react";
import { EmptyState, Icon, Row, useNotify } from "@canonical/react-components";
import type { LxdNetwork } from "types/network";
import DocLink from "components/DocLink";
import { useLoadBalancerPools } from "context/useLoadBalancerPools";
import { useCurrentProject } from "context/useCurrentProject";
import LoadBalancerPoolsTable from "pages/networks/LoadBalancerPoolsTable";
import CreateLoadBalancerPoolBtn from "pages/networks/actions/CreateLoadBalancerPoolBtn";
import LoadBalancerTableHeading from "pages/networks/LoadBalancerTableHeading";

interface Props {
  network: LxdNetwork;
}

const LoadBalancerPoolsTab: FC<Props> = ({ network }) => {
  const { projectName: project } = useCurrentProject();
  const notify = useNotify();
  const {
    data: pools = [],
    error,
    isLoading,
  } = useLoadBalancerPools(network.name, project);

  if (error) {
    notify.failure("Loading network load balancer pools failed", error);
  }

  const hasPools = pools.length > 0 || isLoading;

  if (!hasPools) {
    return (
      <EmptyState
        className="empty-state"
        image={<Icon className="empty-state-icon" name="exposed" />}
        title="No load balancer pools found"
      >
        <p>There are no load balancer pools in this network.</p>
        <p>
          <DocLink docPath="/howto/network_load_balancers/" hasExternalIcon>
            Learn more about load balancer pools
          </DocLink>
        </p>
        <CreateLoadBalancerPoolBtn
          network={network}
          className="empty-state-button"
        />
      </EmptyState>
    );
  }

  return (
    <Row className="content">
      <LoadBalancerTableHeading title="Load balancer pools">
        <CreateLoadBalancerPoolBtn
          network={network}
          className="u-float-right"
        />
      </LoadBalancerTableHeading>
      <LoadBalancerPoolsTable loadBalancerPools={pools} network={network} />
    </Row>
  );
};

export default LoadBalancerPoolsTab;
