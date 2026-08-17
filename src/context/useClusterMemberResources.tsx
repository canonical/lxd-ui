import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchResources } from "api/server";
import type { LxdResources } from "types/resources";
import { queryKeys } from "util/queryKeys";

export const useClusterMemberResources = (
  serverName?: string,
): UseQueryResult<LxdResources> => {
  return useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      serverName ?? undefined,
      queryKeys.resources,
    ],
    queryFn: async () => fetchResources(serverName),
    enabled: !!serverName,
  });
};
