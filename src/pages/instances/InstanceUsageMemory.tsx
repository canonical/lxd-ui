import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchMetrics } from "api/metrics";
import { humanFileSize } from "util/helpers";
import { getInstanceMetrics } from "util/metricSelectors";
import Meter from "components/Meter";
import type { LxdInstance } from "types/instance";
import { useAuth } from "context/auth";

interface Props {
  instance: LxdInstance;
}

const InstanceUsageMemory: FC<Props> = ({ instance }) => {
  const { isRestricted } = useAuth();

  const { data: metrics = [] } = useQuery({
    queryKey: [queryKeys.metrics],
    queryFn: fetchMetrics,
    refetchInterval: 15 * 1000, // 15 seconds
    enabled: !isRestricted,
  });

  const instanceMetrics = getInstanceMetrics(metrics, instance);

  return instanceMetrics.memory ? (
    <div>
      <Meter
        percentage={
          (100 / instanceMetrics.memory.total) *
          (instanceMetrics.memory.total -
            instanceMetrics.memory.free -
            instanceMetrics.memory.cached)
        }
        secondaryPercentage={
          (100 / instanceMetrics.memory.total) * instanceMetrics.memory.cached
        }
        text={
          humanFileSize(
            instanceMetrics.memory.total - instanceMetrics.memory.free,
          ) +
          " of " +
          humanFileSize(instanceMetrics.memory.total)
        }
      />
    </div>
  ) : (
    ""
  );
};

export default InstanceUsageMemory;
