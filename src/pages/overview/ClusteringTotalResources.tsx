import type { FC } from "react";
import { useQueries } from "@tanstack/react-query";
import { Notification, Spinner } from "@canonical/react-components";
import { fetchClusterMemberState } from "api/cluster-members";
import classnames from "classnames";
import Meter from "components/Meter";
import { useClusterMembers } from "context/useClusterMembers";
import { useIsClustered } from "context/useIsClustered";
import { useResources } from "context/useResources";
import { queryKeys } from "util/queryKeys";
import { getCpuText, getMemoryText } from "util/resourceDetails";

const ClusteringTotalResources: FC = () => {
  const isClustered = useIsClustered();
  const { data: members = [], isLoading: isMembersLoading } =
    useClusterMembers();

  const onlineMemberNames = members
    .filter((member) => member.status === "Online")
    .map((member) => member.server_name);

  const memberStateQueries = useQueries({
    queries: onlineMemberNames.map((name) => ({
      queryKey: [queryKeys.cluster, queryKeys.members, name, queryKeys.state],
      queryFn: async () => fetchClusterMemberState(name),
      enabled: isClustered && !isMembersLoading,
      refetchInterval: 15000,
    })),
  });

  const { data: resources, isLoading: isResourcesLoading } = useResources(
    undefined,
    !isClustered,
  );

  const isLoading = isClustered
    ? isMembersLoading || memberStateQueries.some((query) => query.isLoading)
    : isResourcesLoading;
  const allMemberStatesSettled = memberStateQueries.every(
    (query) => query.isSuccess || query.isError,
  );
  const reportedMemberCount = memberStateQueries.filter(
    (query) => query.isSuccess,
  ).length;
  const hasIncompleteClusterResources =
    isClustered &&
    allMemberStatesSettled &&
    reportedMemberCount < members.length;

  const totals = isClustered
    ? memberStateQueries.reduce(
        (acc, query) => {
          const sysinfo = query.data?.sysinfo;

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
      )
    : {
        memory: {
          total:
            resources && !Array.isArray(resources) ? resources.memory.total : 0,
          used:
            resources && !Array.isArray(resources) ? resources.memory.used : 0,
        },
        cpu: {
          total:
            resources && !Array.isArray(resources) ? resources.cpu.total : 0,
          used: 0, // TODO: Implement when backend ready
        },
      };

  const memoryPercentage = totals.memory.total
    ? (totals.memory.used / totals.memory.total) * 100
    : 0;
  const cpuPercentage = totals.cpu.total
    ? Math.min(100, (totals.cpu.used / totals.cpu.total) * 100)
    : 0;

  return (
    <>
      {hasIncompleteClusterResources && (
        <Notification severity="information" title="Partial resource data">
          Resource usage includes data from online members only.
        </Notification>
      )}
      <div
        className={classnames("total-resources", {
          "with-margin-bottom": !isClustered,
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
          ) : !isClustered ? (
            <div>-</div>
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
