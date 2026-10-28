import type { FC } from "react";
import { Spinner } from "@canonical/react-components";
import classnames from "classnames";
import Meter from "components/Meter";
import { useClusterMembersWithState } from "context/useClusterMembers";
import { useIsClustered } from "context/useIsClustered";
import { getCpuText, getMemoryText } from "util/resourceDetails";
import { useServerState } from "context/useSettings";

const ClusteringTotalResources: FC = () => {
  const isClustered = useIsClustered();
  const { data: members = [], isLoading: isMembersLoading } =
    useClusterMembersWithState();

  const hasNotOnlineMembers = members.some(
    (member) => member.status !== "Online",
  );

  const { data: serverState, isLoading: isServerStateLoading } =
    useServerState(!isClustered);

  const isLoading = isClustered ? isMembersLoading : isServerStateLoading;

  const memberStates = members.map((member) => member.state);

  const totalStates = isClustered ? memberStates : [serverState];
  const totals = totalStates.reduce(
    (acc, memberState) => {
      const sysinfo = memberState?.sysinfo;
      if (sysinfo) {
        acc.memory.total += sysinfo.total_ram;
        acc.memory.used += Math.max(
          0,
          sysinfo.total_ram - sysinfo.free_ram - sysinfo.buffered_ram,
        );
        acc.cpu.total += sysinfo.logical_cpus || 0;
        acc.cpu.used += sysinfo.load_averages?.[0] || 0;
      }

      return acc;
    },
    {
      memory: { total: 0, used: 0 },
      cpu: { total: 0, used: 0 },
    },
  );

  const memoryPercentage = totals.memory.total
    ? (totals.memory.used / totals.memory.total) * 100
    : 0;
  const cpuPercentage = totals.cpu.total
    ? Math.min(100, (totals.cpu.used / totals.cpu.total) * 100)
    : 0;

  return (
    <>
      {isClustered && (
        <>
          <h5
            className={classnames({
              "u-no-margin--bottom": hasNotOnlineMembers,
            })}
          >
            Resource usage
          </h5>
          {hasNotOnlineMembers && (
            <p>Resource usage includes data from online members only</p>
          )}
        </>
      )}
      <div
        className={classnames("total-resources", {
          "with-margin-bottom": !isClustered,
          "with-border": isClustered,
        })}
      >
        <div className="total-memory">
          <label id="total-memory-label">Total memory</label>
          {isLoading ? (
            <div>
              <Spinner text="Loading..." />
            </div>
          ) : (
            <Meter
              percentage={memoryPercentage}
              text={getMemoryText(
                totals.memory.used,
                totals.memory.total,
                memoryPercentage,
              )}
              ariaLabelledby="total-memory-label"
            />
          )}
        </div>

        <div className="total-cpu">
          <label id="total-cpu-label">Total CPU</label>
          {isLoading ? (
            <div>
              <Spinner text="Loading..." />
            </div>
          ) : (
            <Meter
              percentage={cpuPercentage}
              text={getCpuText(cpuPercentage)}
              ariaLabelledby="total-cpu-label"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ClusteringTotalResources;
