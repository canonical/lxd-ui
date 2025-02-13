import { FC } from "react";
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
