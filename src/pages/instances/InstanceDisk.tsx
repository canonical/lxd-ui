import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import { getInstanceMetrics } from "util/metricSelectors";
import Meter from "components/Meter";
import type { LxdInstance } from "types/instance";
import { useMetrics } from "context/useMetrics";

interface Props {
  instance: LxdInstance;
}

const InstanceUsageDisk: FC<Props> = ({ instance }) => {
  const { data: metrics = [] } = useMetrics(instance.location);

  const instanceMetrics = getInstanceMetrics(metrics, instance);
  const disk = instanceMetrics.disk;

  if (!disk) {
    return "";
  }

  const used = disk.total - disk.free;

  return (
    <div>
      <Meter
        percentage={(100 / disk.total) * used}
        text={
          humanFileSize(disk.total - disk.free) +
          " of " +
          humanFileSize(disk.total)
        }
        hoverText={`free: ${humanFileSize(disk.free)}\nused: ${humanFileSize(used)}`}
      />
    </div>
  );
};

export default InstanceUsageDisk;
