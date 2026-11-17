import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import type { MemoryUsage } from "util/metricSelectors";
import { getMemoryText } from "util/resourceDetails";
import Meter from "components/Meter";

interface Props {
  memory?: MemoryUsage;
}

const InstanceUsageMemory: FC<Props> = ({ memory }) => {
  if (!memory?.total) {
    return "";
  }

  const used = Math.max(0, memory.total - memory.free - memory.cached);
  const usedPercentage = (used / memory.total) * 100;

  return (
    <div>
      <Meter
        percentage={usedPercentage}
        secondaryPercentage={(memory.cached / memory.total) * 100}
        text={getMemoryText(used, memory.total, usedPercentage, true)}
        hoverText={
          `used: ${humanFileSize(used)}\n` +
          `cached: ${humanFileSize(memory.cached)}\n` +
          `free: ${humanFileSize(memory.free)}\n`
        }
      />
    </div>
  );
};

export default InstanceUsageMemory;
