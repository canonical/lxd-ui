import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchClusterMemberState } from "api/cluster-members";

export const useClusterMemberState = (serverName?: string) => {
  return useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      serverName ?? undefined,
      queryKeys.state,
    ],
    queryFn: async () => fetchClusterMemberState(serverName ?? ""),
    enabled: !!serverName,
  });
};
