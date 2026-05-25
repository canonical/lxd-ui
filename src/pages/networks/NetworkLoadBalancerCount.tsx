import type { FC } from "react";
import type { LxdNetwork } from "types/network";
import { typesWithLoadBalancers } from "util/networks";
import { useLoadBalancers } from "context/useLoadBalancers";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkLoadBalancerCount: FC<Props> = ({ network, project }) => {
  if (
    network.managed === false ||
    !typesWithLoadBalancers.includes(network.type)
  ) {
    return <>-</>;
  }

  const { data: balancers = [], isLoading } = useLoadBalancers(
    network.name,
    project,
  );

  return <>{isLoading ? "" : balancers.length}</>;
};

export default NetworkLoadBalancerCount;
