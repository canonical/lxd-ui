import type { FC } from "react";
import { Spinner } from "@canonical/react-components";
import classnames from "classnames";
import Meter from "components/Meter";
import { useClusterMembers } from "context/useClusterMembers";
import { useClusterMemberStates } from "context/useClusterMemberState";
import { useIsClustered } from "context/useIsClustered";
import { getCpuText, getMemoryText } from "util/resourceDetails";
import { useServerState } from "context/useSettings";
import type { UseQueryResult } from "@tanstack/react-query";
import type { LxdClusterMemberState } from "types/cluster";

const ClusteringTotalResources: FC = () => {
  const isClustered = useIsClustered();
  const { data: members = [], isLoading: isMembersLoading } =
    useClusterMembers();

  const onlineMemberNames = members
    .filter((member) => member.status === "Online")
    .map((member) => member.server_name);
  const hasNotOnlineMembers = members.some(
    (member) => member.status !== "Online",
  );

  const memberStateQueries = useClusterMemberStates(onlineMemberNames);

  const { data: serverState, isLoading: isServerStateLoading } =
    useServerState(!isClustered);

  const isLoading = isClustered
    ? isMembersLoading || memberStateQueries.some((query) => query.isLoading)
    : isServerStateLoading;

  const totalQueries = isClustered ? memberStateQueries : [serverState];
  const totals = totalQueries.reduce(
    (acc, query) => {
      const sysinfo = isClustered
        ? (query as UseQueryResult<LxdClusterMemberState>).data?.sysinfo
        : serverState?.sysinfo;

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
