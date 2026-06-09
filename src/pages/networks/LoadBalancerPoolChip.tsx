import type { FC } from "react";
import ResourceLink from "components/ResourceLink";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  name: string;
  network: string;
  project: string;
}

const LoadBalancerPoolChip: FC<Props> = ({ name, network, project }) => {
  return (
    <ResourceLink
      type="load-balancer-pool"
      value={name}
      to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network)}/load-balancers/pools`}
    />
  );
};

export default LoadBalancerPoolChip;
