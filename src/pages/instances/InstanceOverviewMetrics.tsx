import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchMetrics } from "api/metrics";
import { getInstanceMetrics } from "util/metricSelectors";
import Loader from "components/Loader";
import type { LxdInstance } from "types/instance";
import { useAuth } from "context/auth";
import InstanceUsageMemory from "pages/instances/InstanceUsageMemory";
import InstanceUsageDisk from "pages/instances/InstanceDisk";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewMetrics: FC<Props> = ({ instance, onFailure }) => {
  const { isRestricted } = useAuth();

  const {
    data: metrics = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.metrics],
    queryFn: fetchMetrics,
    refetchInterval: 15 * 1000, // 15 seconds
    enabled: !isRestricted,
  });

  if (error) {
    onFailure("Loading metrics failed", error);
  }

  const instanceMetrics = getInstanceMetrics(metrics, instance);

  if (isRestricted) {
    return (
      <div className="u-text--muted">
        Details are not available for restricted users
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <Loader text="Loading metrics..." />
      ) : (
        <table>
          <tbody>
            <tr className="metric-row">
              <th className="u-text--muted">Memory</th>
              <td>
                {instanceMetrics.memory ? (
                  <InstanceUsageMemory instance={instance} />
                ) : (
                  "-"
                )}
              </td>
            </tr>
            <tr className="metric-row">
              <th className="u-text--muted">Disk</th>
              <td>
                {instanceMetrics.disk ? (
                  <InstanceUsageDisk instance={instance} />
                ) : (
                  "-"
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
};

export default InstanceOverviewMetrics;
