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

  const memory = instanceMetrics.memory;
  if (!memory) {
    return "";
  }

  const used = memory.total - memory.free - memory.cached;

  return (
    <div>
      <Meter
        percentage={(100 / memory.total) * used}
        secondaryPercentage={(100 / memory.total) * memory.cached}
        text={
          humanFileSize(memory.total - memory.free) +
          " of " +
          humanFileSize(memory.total)
        }
        hoverText={
          `free: ${humanFileSize(memory.free)}\n` +
          `used: ${humanFileSize(used)}\n` +
          `cached: ${humanFileSize(memory.cached)}\n`
        }
      />
    </div>
  );
};

export default InstanceUsageMemory;
