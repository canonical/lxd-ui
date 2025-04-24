import type { FC } from "react";
import { getMemoryUsage } from "util/metricSelectors";
import type { LxdInstance } from "types/instance";
import { useMetrics } from "context/useMetrics";
import InstanceUsageMemory from "pages/instances/InstanceUsageMemory";

interface Props {
  instance: LxdInstance;
}

const InstanceUsageMainMemory: FC<Props> = ({ instance }) => {
  const { data: metrics = [] } = useMetrics(instance.location);
  const memory = getMemoryUsage(metrics, instance);

  return <InstanceUsageMemory memory={memory} />;
};

export default InstanceUsageMainMemory;
