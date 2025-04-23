import type { FC } from "react";
import { useState } from "react";
import { getInstanceMetrics } from "util/metricSelectors";
import Loader from "components/Loader";
import type { LxdInstance } from "types/instance";
import { useAuth } from "context/auth";
import InstanceUsageMemory from "pages/instances/InstanceUsageMemory";
import InstanceUsageDisk from "pages/instances/InstanceUsageDisk";
import { useMetrics } from "context/useMetrics";
import { Button } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewMetrics: FC<Props> = ({ instance, onFailure }) => {
  const { isRestricted } = useAuth();
  const [isShowOtherDisks, setShowOtherDisks] = useState(false);

  const {
    data: metrics = [],
    error,
    isLoading,
  } = useMetrics(instance.location);

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

  const hasOtherDisks = instanceMetrics.otherDisks.length > 0;

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
              <th className="u-text--muted">Root disk</th>
              <td>
                {instanceMetrics.rootDisk ? (
                  <InstanceUsageDisk disk={instanceMetrics.rootDisk} />
                ) : (
                  "-"
                )}
              </td>
            </tr>
            {isShowOtherDisks &&
              instanceMetrics.otherDisks.map((item) => (
                <tr className="metric-row" key={item.device}>
                  <th className="u-text--muted">{item.device}</th>
                  <td>
                    <InstanceUsageDisk disk={item} />
                  </td>
                </tr>
              ))}
            {hasOtherDisks && (
              <tr className="metric-row">
                <th></th>
                <td>
                  <Button
                    appearance="link"
                    onClick={() => {
                      setShowOtherDisks(!isShowOtherDisks);
                    }}
                  >
                    {isShowOtherDisks ? "Hide other disks" : "Show other disks"}
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default InstanceOverviewMetrics;
