import type { FC } from "react";
import { getFilesystemUsage } from "util/metricSelectors";
import type { LxdInstance } from "types/instance";
import { useMetrics } from "context/useMetrics";
import InstanceUsageFilesystem from "pages/instances/InstanceUsageFilesystem";

interface Props {
  instance: LxdInstance;
}

const InstanceUsageRootFilesystem: FC<Props> = ({ instance }) => {
  const { data: metrics = [] } = useMetrics(instance.location);
  const [rootFilesystem] = getFilesystemUsage(metrics, instance);

  return <InstanceUsageFilesystem filesystem={rootFilesystem} />;
};

export default InstanceUsageRootFilesystem;
