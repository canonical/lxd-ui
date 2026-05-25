import type { FC } from "react";
import type { LxdLoadBalancerPool } from "types/loadBalancers";
import type { LxdNetwork } from "types/network";
import { useLoadBalancerPoolState } from "context/useLoadBalancerPools";
import { useCurrentProject } from "context/useCurrentProject";
import { Icon } from "@canonical/react-components";
import LoadBalancerPoolInstanceStatus from "pages/networks/LoadBalancerPoolInstanceStatus";

interface Props {
  pool: LxdLoadBalancerPool;
  network: LxdNetwork;
}

const LoadBalancerPoolInstanceStatuses: FC<Props> = ({ pool, network }) => {
  const { projectName: project } = useCurrentProject();

  const { data: state } = useLoadBalancerPoolState(
    network.name,
    project,
    pool.name,
  );

  const getInstanceStatus = (instance: string) => {
    return (
      state?.targets?.find((item) => item.name === instance)?.status ??
      "unknown"
    );
  };

  if (pool.instances.length === 0) {
    return (
      <>
        <Icon name="status-queued-small" className="status-icon" /> -
      </>
    );
  }

  return pool.instances.map((instance) => {
    const status = getInstanceStatus(instance.name);
    return (
      <div key={instance.name}>
        <LoadBalancerPoolInstanceStatus status={status} />
      </div>
    );
  });
};

export default LoadBalancerPoolInstanceStatuses;
