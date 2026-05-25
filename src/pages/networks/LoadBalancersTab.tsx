import type { FC } from "react";
import {
  EmptyState,
  Icon,
  Row,
  Spinner,
  useNotify,
} from "@canonical/react-components";
import type { LxdNetwork } from "types/network";
import DocLink from "components/DocLink";
import CreateLoadBalancerBtn from "pages/networks/actions/CreateLoadBalancerBtn";
import { useCurrentProject } from "context/useCurrentProject";
import { useLoadBalancers } from "context/useLoadBalancers";
import LoadBalancersTable from "pages/networks/LoadBalancersTable";
import LoadBalancerTableHeading from "pages/networks/LoadBalancerTableHeading";
import CreateLoadBalancerPoolBtn from "pages/networks/actions/CreateLoadBalancerPoolBtn";
import { useLoadBalancerPools } from "context/useLoadBalancerPools";

interface Props {
  network: LxdNetwork;
}

const LoadBalancersTab: FC<Props> = ({ network }) => {
  const { projectName: project } = useCurrentProject();
  const notify = useNotify();

  const {
    data: loadBalancers = [],
    error,
    isLoading,
  } = useLoadBalancers(network.name, project);
  const { data: pools = [] } = useLoadBalancerPools(network.name, project);
  const hasPools = pools.length > 0;

  if (error) {
    notify.failure("Loading network load balancers failed", error);
  }

  const hasLoadBalancers = loadBalancers.length > 0 || isLoading;

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (!hasLoadBalancers) {
    return (
      <EmptyState
        className="empty-state"
        image={<Icon className="empty-state-icon" name="exposed" />}
        title="No load balancers found"
      >
        {hasPools && <p>There are no load balancers in this network.</p>}
        {!hasPools && (
          <>
            <p>There are neither load balancers nor pools in this network.</p>
            <p>
              Create a pool with instances, then use it when creating a load
              balancer.
            </p>
          </>
        )}
        <p>
          <DocLink docPath="/howto/network_load_balancers/" hasExternalIcon>
            Learn more about load balancers
          </DocLink>
        </p>
        <CreateLoadBalancerBtn
          network={network}
          appearance="positive"
          className="empty-state-button"
        />
        <CreateLoadBalancerPoolBtn
          network={network}
          appearance=""
          hasIcon={false}
        />
      </EmptyState>
    );
  }

  return (
    <Row className="content">
      <LoadBalancerTableHeading title="Load balancers">
        <CreateLoadBalancerBtn network={network} className="u-float-right" />
      </LoadBalancerTableHeading>
      <LoadBalancersTable
        loadBalancers={loadBalancers}
        network={network}
        project={project}
      />
    </Row>
  );
};

export default LoadBalancersTab;
