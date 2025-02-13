import { FC } from "react";
import { humanFileSize } from "util/helpers";
import { getInstanceMetrics } from "util/metricSelectors";
import Meter from "components/Meter";
import type { LxdInstance } from "types/instance";
import { useMetrics } from "context/useMetrics";

interface Props {
  instance: LxdInstance;
}

const InstanceUsageMemory: FC<Props> = ({ instance }) => {
  const { data: metrics = [] } = useMetrics(instance.location);

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
