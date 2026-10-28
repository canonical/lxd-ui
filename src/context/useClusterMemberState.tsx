import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchClusterMemberState } from "api/cluster-members";
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
