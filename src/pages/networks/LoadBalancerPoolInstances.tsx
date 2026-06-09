import type { FC } from "react";
import type { LxdLoadBalancerPool } from "types/loadBalancers";
import { InstanceRichChip } from "pages/instances/InstanceRichChip";
import { useCurrentProject } from "context/useCurrentProject";

interface Props {
  pool: LxdLoadBalancerPool;
}

const LoadBalancerPoolInstances: FC<Props> = ({ pool }) => {
  const { projectName: project } = useCurrentProject();

  if (pool.instances.length === 0) {
    return "-";
  }

  return pool.instances.map((instance) => {
    return (
      <div key={instance.name}>
        <InstanceRichChip instanceName={instance.name} projectName={project} />
      </div>
    );
  });
};

export default LoadBalancerPoolInstances;
