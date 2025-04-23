import type { FC } from "react";
import { getInstanceMetrics } from "util/metricSelectors";
import type { LxdInstance } from "types/instance";
import { useMetrics } from "context/useMetrics";
import InstanceUsageDisk from "pages/instances/InstanceUsageDisk";

interface Props {
  instance: LxdInstance;
}

const InstanceUsageRootDisk: FC<Props> = ({ instance }) => {
  const { data: metrics = [] } = useMetrics(instance.location);
  const instanceMetrics = getInstanceMetrics(metrics, instance);

  return <InstanceUsageDisk disk={instanceMetrics.rootDisk} />;
};

export default InstanceUsageRootDisk;
