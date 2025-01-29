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

const InstanceUsageDisk: FC<Props> = ({ instance }) => {
  const { isRestricted } = useAuth();

  const { data: metrics = [] } = useQuery({
    queryKey: [queryKeys.metrics],
    queryFn: fetchMetrics,
    refetchInterval: 15 * 1000, // 15 seconds
    enabled: !isRestricted,
  });

  const instanceMetrics = getInstanceMetrics(metrics, instance);

  return instanceMetrics.disk ? (
    <div>
      <Meter
        percentage={
          (100 / instanceMetrics.disk.total) *
          (instanceMetrics.disk.total - instanceMetrics.disk.free)
        }
        text={
          humanFileSize(
            instanceMetrics.disk.total - instanceMetrics.disk.free,
          ) +
          " of " +
          humanFileSize(instanceMetrics.disk.total)
        }
      />
    </div>
  ) : (
    ""
  );
};

export default InstanceUsageDisk;
