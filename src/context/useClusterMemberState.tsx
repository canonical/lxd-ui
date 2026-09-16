import {
  useQueries,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { fetchClusterMemberState } from "api/cluster-members";
import { useIsClustered } from "context/useIsClustered";
import type { LxdClusterMemberState } from "types/cluster";
import { queryKeys } from "util/queryKeys";

export const useClusterMemberState = (
  serverName?: string,
  enabled = true,
): UseQueryResult<LxdClusterMemberState> => {
  return useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      serverName ?? undefined,
      queryKeys.state,
    ],
    queryFn: async () => fetchClusterMemberState(serverName ?? ""),
    enabled: !!serverName && enabled,
  });
};

export const useClusterMemberStates = (
  serverNames: string[],
): UseQueryResult<LxdClusterMemberState>[] => {
  const isClustered = useIsClustered();

  return useQueries({
    queries: serverNames.map((name) => ({
      queryKey: [queryKeys.cluster, queryKeys.members, name, queryKeys.state],
      queryFn: async () => fetchClusterMemberState(name),
      enabled: isClustered,
      refetchInterval: 15000,
    })),
  });
};
