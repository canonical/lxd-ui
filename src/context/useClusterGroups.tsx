import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdClusterGroup } from "types/cluster";
import { fetchClusterGroup, fetchClusterGroups } from "api/cluster-groups";

export const useClusterGroups = (
  enabled = true,
): UseQueryResult<LxdClusterGroup[]> => {
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.groups],
    queryFn: fetchClusterGroups,
    enabled,
  });
};

export const useClusterGroup = (
  group: string,
): UseQueryResult<LxdClusterGroup> => {
  return useQuery({
    queryKey: [queryKeys.cluster, queryKeys.groups, group],
    queryFn: async () => fetchClusterGroup(group),
  });
};
