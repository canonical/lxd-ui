import type { FC } from "react";
import { useState } from "react";
import { getInstanceMetricReport } from "util/metricSelectors";
import Loader from "components/Loader";
import type { LxdInstance } from "types/instance";
import { useAuth } from "context/auth";
import InstanceUsageMemory from "pages/instances/InstanceUsageMemory";
import InstanceUsageFilesystem from "pages/instances/InstanceUsageFilesystem";
import { useMetrics } from "context/useMetrics";
import { Button } from "@canonical/react-components";
import InstanceUsageCpu from "pages/instances/InstanceUsageCpu";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewMetrics: FC<Props> = ({ instance, onFailure }) => {
  const { isRestricted } = useAuth();
  const [isShowAllFilesystems, setShowAllFilesystems] = useState(false);

  const {
    data: serverMetrics = [],
    error,
    isLoading,
  } = useMetrics(instance.location);

  if (error) {
    onFailure("Loading metrics failed", error);
  }

  const instanceMetrics = getInstanceMetricReport(serverMetrics, instance);

  if (isRestricted) {
    return (
      <div className="u-text--muted">
        Details are not available for restricted users
      </div>
    );
  }

  const hasOtherFilesystems = instanceMetrics.otherFilesystems.length > 0;

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
                  <InstanceUsageMemory memory={instanceMetrics.memory} />
                ) : (
                  "-"
                )}
              </td>
            </tr>
            <tr className="metric-row">
              <th className="u-text--muted">Root filesystem</th>
              <td>
                {instanceMetrics.rootFilesystem ? (
                  <InstanceUsageFilesystem
                    filesystem={instanceMetrics.rootFilesystem}
                  />
                ) : (
                  "-"
                )}
              </td>
            </tr>
            {isShowAllFilesystems &&
              instanceMetrics.otherFilesystems.map((item) => (
                <tr className="metric-row" key={item.device}>
                  <th className="u-text--muted">{item.device}</th>
                  <td>
                    <InstanceUsageFilesystem filesystem={item} />
                  </td>
                </tr>
              ))}
            {hasOtherFilesystems && (
              <tr className="metric-row">
                <th></th>
                <td>
                  <Button
                    appearance="link"
                    className="u-no-margin--bottom"
                    onClick={() => {
                      setShowAllFilesystems(!isShowAllFilesystems);
                    }}
                  >
                    {isShowAllFilesystems
                      ? "Hide other filesystems"
                      : "Show other filesystems"}
                  </Button>
                </td>
              </tr>
            )}
            <tr className="metric-row">
              <th className="u-text--muted">CPU</th>
              <td>
                {instanceMetrics.memory ? (
                  <InstanceUsageCpu instance={instance} />
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
