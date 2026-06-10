import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { useLoadBalancerPoolState } from "context/useLoadBalancerPools";
import type { LxdLoadBalancerPool } from "types/loadBalancers";
import LoadBalancerPoolInstanceStatus from "pages/networks/LoadBalancerPoolInstanceStatus";

interface Props {
  instance: LxdInstance;
  pool: LxdLoadBalancerPool;
  network: string;
}

const InstanceLoadBalancerPoolStatus: FC<Props> = ({
  instance,
  pool,
  network,
}) => {
  const { data: poolStatuses } = useLoadBalancerPoolState(
    network,
    instance.project,
    pool.name,
  );

  const poolStatus = poolStatuses?.targets?.find(
    (target) => target.name === instance.name,
  );

  return <LoadBalancerPoolInstanceStatus status={poolStatus?.status} />;
};

export default InstanceLoadBalancerPoolStatus;
