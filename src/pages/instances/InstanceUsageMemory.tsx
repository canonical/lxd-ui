import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import type { MemoryUsage } from "util/metricSelectors";
import Meter from "components/Meter";

interface Props {
  memory?: MemoryUsage;
}

const InstanceUsageMemory: FC<Props> = ({ memory }) => {
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
