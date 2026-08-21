import type { FC } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Spinner } from "@canonical/react-components";
import { fetchClusterMemberState } from "api/cluster-members";
import {
  fetchStoragePools,
  fetchStoragePoolResources,
} from "api/storage-pools";
import Meter from "components/Meter";
import { useClusterMembers } from "context/useClusterMembers";
import { useIsClustered } from "context/useIsClustered";
import { useResources } from "context/useResources";
import { humanFileSize } from "util/helpers";
import { queryKeys } from "util/queryKeys";
import { getCpuText } from "util/resourceDetails";

const ClusteringTotalResources: FC = () => {
  const isClustered = useIsClustered();
  const { data: members = [], isLoading: isMembersLoading } =
    useClusterMembers();

  const memberQueries = useQueries({
    queries: (isClustered ? members : []).map((member) => ({
      queryKey: [
        queryKeys.cluster,
        queryKeys.members,
        member.server_name,
        queryKeys.state,
      ],
      queryFn: async () => fetchClusterMemberState(member.server_name),
      enabled: Boolean(member.server_name),
      refetchInterval: 5000,
    })),
  });

  const { data: localResources, isLoading: isResourcesLoading } =
    useResources();

  // Fetch local storage pools for unclustered nodes
  const { data: unclusteredStorage, isLoading: isUnclusteredStorageLoading } =
    useQuery({
      queryKey: [queryKeys.storage, "unclustered-totals"],
      queryFn: async () => {
        const pools = await fetchStoragePools(false);
        const resources = await Promise.all(
          pools.map(async (pool) => fetchStoragePoolResources(pool.name)),
        );

        return resources.reduce(
          (acc, res) => {
            acc.total += res.space?.total || 0;
            acc.used += res.space?.used || 0;
            return acc;
          },
          { used: 0, total: 0 },
        );
      },
      enabled: !isClustered,
    });

  const isStatesLoading = memberQueries.some((query) => query.isLoading);
  const isLoading = isClustered
    ? isMembersLoading || isStatesLoading
    : isResourcesLoading || isUnclusteredStorageLoading;

  const totals = isClustered
    ? memberQueries.reduce(
        (acc, query) => {
          const state = query.data;
          if (!state) return acc;

          const sysinfo = state.sysinfo;
          const storagePools = state.storage_pools || {};

          if (sysinfo) {
            acc.memory.total += sysinfo.total_ram;
            acc.memory.used += Math.max(
              0,
              sysinfo.total_ram - sysinfo.free_ram - sysinfo.buffered_ram,
            );
            acc.cpu.total += sysinfo.logical_cpus || 0;
            acc.cpu.used += sysinfo.load_averages?.[0] || 0;
          }

          Object.values(storagePools).forEach((pool) => {
            acc.storage.total += pool.space?.total || 0;
            acc.storage.used += pool.space?.used || 0;
          });

          return acc;
        },
        {
          memory: { total: 0, used: 0 },
          cpu: { total: 0, used: 0 },
          storage: { total: 0, used: 0 },
        },
      )
    : {
        memory: {
          total:
            localResources && !Array.isArray(localResources)
              ? localResources.memory.total
              : 0,
          used:
            localResources && !Array.isArray(localResources)
              ? localResources.memory.used
              : 0,
        },
        cpu: {
          total:
            localResources && !Array.isArray(localResources)
              ? localResources.cpu.total
              : 0,
          used: 0,
        },
        storage: {
          total: unclusteredStorage?.total || 0,
          used: unclusteredStorage?.used || 0,
        },
      };

  const cpuPercentage = totals.cpu.total
    ? Math.min(100, (totals.cpu.used / totals.cpu.total) * 100)
    : 0;

  return (
    <div className="total-resources">
      <div className="total-memory">
        <label id="total-memory-label">Total memory</label>
        {isLoading ? (
          <div>
            <Spinner text="Loading..." />
          </div>
        ) : (
          <Meter
            percentage={
              totals.memory.total
                ? (totals.memory.used / totals.memory.total) * 100
                : 0
            }
            text={`${humanFileSize(totals.memory.used)} of ${humanFileSize(
              totals.memory.total,
            )}`}
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
            text={getCpuText({
              total: totals.cpu.total,
              percentage: cpuPercentage,
            })}
            ariaLabelledby="total-cpu-label"
            isSegmented
            totalSegments={totals.cpu.total || 1}
          />
        )}
      </div>

      <div className="total-storage">
        <label id="total-storage-label">Total storage</label>
        {isLoading ? (
          <div>
            <Spinner text="Loading..." />
          </div>
        ) : (
          <Meter
            percentage={
              totals.storage.total
                ? (totals.storage.used / totals.storage.total) * 100
                : 0
            }
            text={`${humanFileSize(totals.storage.used)} of ${humanFileSize(
              totals.storage.total,
            )} used`}
            ariaLabelledby="total-storage-label"
          />
        )}
      </div>
    </div>
  );
};

export default ClusteringTotalResources;
