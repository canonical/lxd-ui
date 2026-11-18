import type { FC } from "react";
import type { LxdLoadBalancerPool } from "types/loadBalancers";
import { InstanceRichChipWithActions } from "pages/instances/InstanceRichChipWithActions";
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
        <InstanceRichChipWithActions
          instanceName={instance.name}
          projectName={project}
        />
      </div>
    );
  });
};

export default LoadBalancerPoolInstances;
